from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64
from io import BytesIO
from PIL import Image

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'manado-golf-league-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== Models ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str = "player"  # admin or player
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "player"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Team(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    captain_id: str
    logo: Optional[str] = None  # Base64 encoded image
    payment_status: bool = False
    registration_fee: float = 500000  # Captain fee
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeamCreate(BaseModel):
    name: str
    captain_id: str

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    captain_id: Optional[str] = None
    logo: Optional[str] = None
    payment_status: Optional[bool] = None

class Player(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[EmailStr] = None
    team_id: str
    handicap: Optional[int] = 0
    photo: Optional[str] = None  # Base64 encoded image
    registration_fee: float = 100000
    payment_status: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlayerCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    team_id: str
    handicap: Optional[int] = 0
    photo: Optional[str] = None

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    team_id: Optional[str] = None
    handicap: Optional[int] = None
    payment_status: Optional[bool] = None
    photo: Optional[str] = None

class Match(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_number: int
    date: str
    status: str = "scheduled"  # scheduled, completed
    match_type: str = "individual"  # individual or team
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MatchCreate(BaseModel):
    match_number: int
    date: str
    match_type: str = "individual"

class MatchUpdate(BaseModel):
    date: Optional[str] = None
    status: Optional[str] = None
    match_type: Optional[str] = None

class MatchResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    player_id: str
    points: int
    position: Optional[int] = None  # 1, 2, 3, 4, or participation
    attended: bool = True
    pairing: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MatchResultCreate(BaseModel):
    match_id: str
    player_id: str
    points: int
    position: Optional[int] = None
    attended: bool = True
    pairing: Optional[str] = None

class Transfer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_id: str
    from_team_id: str
    to_team_id: str
    transfer_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

class TransferCreate(BaseModel):
    player_id: str
    from_team_id: str
    to_team_id: str
    notes: Optional[str] = None

class AppSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "app_settings"  # Single document ID
    dashboard_logo: Optional[str] = None
    footer_signature: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== Helper Functions ====================

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== Auth Routes ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    
    # Create user
    user = User(email=user_data.email, name=user_data.name, role=user_data.role)
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['password'] = hashed.decode('utf-8')
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_dict = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_dict:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user_dict['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_dict)
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== Team Routes ====================

@api_router.get("/teams", response_model=List[Team])
async def get_teams(current_user: User = Depends(get_current_user)):
    teams = await db.teams.find({}, {"_id": 0}).to_list(1000)
    return teams

@api_router.post("/teams", response_model=Team)
async def create_team(team_data: TeamCreate, current_user: User = Depends(get_admin_user)):
    team = Team(**team_data.model_dump())
    team_dict = team.model_dump()
    team_dict['created_at'] = team_dict['created_at'].isoformat()
    await db.teams.insert_one(team_dict)
    return team

@api_router.put("/teams/{team_id}", response_model=Team)
async def update_team(team_id: str, team_data: TeamUpdate, current_user: User = Depends(get_admin_user)):
    existing = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Team not found")
    
    update_data = {k: v for k, v in team_data.model_dump().items() if v is not None}
    if update_data:
        await db.teams.update_one({"id": team_id}, {"$set": update_data})
    
    updated = await db.teams.find_one({"id": team_id}, {"_id": 0})
    return Team(**updated)

@api_router.delete("/teams/{team_id}")
async def delete_team(team_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.teams.delete_one({"id": team_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team deleted successfully"}

@api_router.post("/teams/{team_id}/logo")
async def upload_team_logo(team_id: str, logo: str, current_user: User = Depends(get_admin_user)):
    existing = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Team not found")
    
    await db.teams.update_one({"id": team_id}, {"$set": {"logo": logo}})
    return {"message": "Logo uploaded successfully"}

# ==================== Player Routes ====================

@api_router.get("/players", response_model=List[Player])
async def get_players(team_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"team_id": team_id} if team_id else {}
    players = await db.players.find(query, {"_id": 0}).to_list(1000)
    return players

@api_router.post("/players", response_model=Player)
async def create_player(player_data: PlayerCreate, current_user: User = Depends(get_admin_user)):
    # Check if team exists
    team = await db.teams.find_one({"id": player_data.team_id}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check player count (max 6 per team)
    player_count = await db.players.count_documents({"team_id": player_data.team_id})
    if player_count >= 6:
        raise HTTPException(status_code=400, detail="Team already has 6 players")
    
    player = Player(**player_data.model_dump())
    player_dict = player.model_dump()
    player_dict['created_at'] = player_dict['created_at'].isoformat()
    await db.players.insert_one(player_dict)
    return player

@api_router.put("/players/{player_id}", response_model=Player)
async def update_player(player_id: str, player_data: PlayerUpdate, current_user: User = Depends(get_admin_user)):
    existing = await db.players.find_one({"id": player_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Player not found")
    
    update_data = {k: v for k, v in player_data.model_dump().items() if v is not None}
    if update_data:
        await db.players.update_one({"id": player_id}, {"$set": update_data})
    
    updated = await db.players.find_one({"id": player_id}, {"_id": 0})
    return Player(**updated)

@api_router.delete("/players/{player_id}")
async def delete_player(player_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.players.delete_one({"id": player_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    return {"message": "Player deleted successfully"}

# ==================== Match Routes ====================

@api_router.get("/matches", response_model=List[Match])
async def get_matches(current_user: User = Depends(get_current_user)):
    matches = await db.matches.find({}, {"_id": 0}).sort("match_number", 1).to_list(1000)
    return matches

@api_router.post("/matches", response_model=Match)
async def create_match(match_data: MatchCreate, current_user: User = Depends(get_admin_user)):
    match = Match(**match_data.model_dump())
    match_dict = match.model_dump()
    match_dict['created_at'] = match_dict['created_at'].isoformat()
    await db.matches.insert_one(match_dict)
    return match

@api_router.put("/matches/{match_id}", response_model=Match)
async def update_match(match_id: str, match_data: MatchUpdate, current_user: User = Depends(get_admin_user)):
    existing = await db.matches.find_one({"id": match_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Match not found")
    
    update_data = {k: v for k, v in match_data.model_dump().items() if v is not None}
    if update_data:
        await db.matches.update_one({"id": match_id}, {"$set": update_data})
    
    updated = await db.matches.find_one({"id": match_id}, {"_id": 0})
    return Match(**updated)

@api_router.delete("/matches/{match_id}")
async def delete_match(match_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.matches.delete_one({"id": match_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Match not found")
    return {"message": "Match deleted successfully"}

# ==================== Match Result Routes ====================

@api_router.get("/match-results")
async def get_match_results(match_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"match_id": match_id} if match_id else {}
    results = await db.match_results.find(query, {"_id": 0}).to_list(1000)
    return results

@api_router.post("/match-results", response_model=MatchResult)
async def create_match_result(result_data: MatchResultCreate, current_user: User = Depends(get_admin_user)):
    result = MatchResult(**result_data.model_dump())
    result_dict = result.model_dump()
    result_dict['created_at'] = result_dict['created_at'].isoformat()
    await db.match_results.insert_one(result_dict)
    return result

@api_router.post("/match-results/bulk")
async def create_bulk_match_results(results_data: List[MatchResultCreate], current_user: User = Depends(get_admin_user)):
    results = []
    for result_data in results_data:
        result = MatchResult(**result_data.model_dump())
        result_dict = result.model_dump()
        result_dict['created_at'] = result_dict['created_at'].isoformat()
        results.append(result_dict)
    
    if results:
        await db.match_results.insert_many(results)
    return {"message": f"{len(results)} results added successfully"}

# ==================== Leaderboard Routes ====================

@api_router.get("/leaderboard/individual")
async def get_individual_leaderboard(current_user: User = Depends(get_current_user)):
    # Get all players
    players = await db.players.find({}, {"_id": 0}).to_list(1000)
    
    # Calculate points for each player
    leaderboard = []
    for player in players:
        results = await db.match_results.find({"player_id": player["id"]}, {"_id": 0}).to_list(1000)
        
        # Sort by points descending and take top 6
        sorted_results = sorted(results, key=lambda x: x["points"], reverse=True)[:6]
        total_points = sum(r["points"] for r in sorted_results)
        matches_played = len(results)
        
        # Get team info
        team = await db.teams.find_one({"id": player["team_id"]}, {"_id": 0})
        
        leaderboard.append({
            "player_id": player["id"],
            "player_name": player["name"],
            "team_id": player["team_id"],
            "team_name": team["name"] if team else "No Team",
            "total_points": total_points,
            "matches_played": matches_played,
            "best_6_matches": sorted_results
        })
    
    # Sort by total points
    leaderboard.sort(key=lambda x: x["total_points"], reverse=True)
    return leaderboard

@api_router.get("/leaderboard/team")
async def get_team_leaderboard(current_user: User = Depends(get_current_user)):
    # Get all teams
    teams = await db.teams.find({}, {"_id": 0}).to_list(1000)
    
    leaderboard = []
    for team in teams:
        # Get all players in team
        players = await db.players.find({"team_id": team["id"]}, {"_id": 0}).to_list(1000)
        
        team_total = 0
        player_details = []
        
        for player in players:
            # Get player results
            results = await db.match_results.find({"player_id": player["id"]}, {"_id": 0}).to_list(1000)
            
            # Sort by points and take top 2
            sorted_results = sorted(results, key=lambda x: x["points"], reverse=True)[:2]
            player_points = sum(r["points"] for r in sorted_results)
            team_total += player_points
            
            player_details.append({
                "player_name": player["name"],
                "points": player_points,
                "matches_counted": len(sorted_results)
            })
        
        leaderboard.append({
            "team_id": team["id"],
            "team_name": team["name"],
            "team_logo": team.get("logo"),
            "total_points": team_total,
            "player_count": len(players),
            "players": player_details
        })
    
    # Sort by total points
    leaderboard.sort(key=lambda x: x["total_points"], reverse=True)
    return leaderboard

# ==================== Transfer Routes ====================

@api_router.get("/transfers", response_model=List[Transfer])
async def get_transfers(current_user: User = Depends(get_current_user)):
    transfers = await db.transfers.find({}, {"_id": 0}).sort("transfer_date", -1).to_list(1000)
    return transfers

@api_router.post("/transfers", response_model=Transfer)
async def create_transfer(transfer_data: TransferCreate, current_user: User = Depends(get_admin_user)):
    # Update player's team
    await db.players.update_one(
        {"id": transfer_data.player_id},
        {"$set": {"team_id": transfer_data.to_team_id}}
    )
    
    transfer = Transfer(**transfer_data.model_dump())
    transfer_dict = transfer.model_dump()
    transfer_dict['transfer_date'] = transfer_dict['transfer_date'].isoformat()
    await db.transfers.insert_one(transfer_dict)
    return transfer

# ==================== Dashboard Stats ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    teams_count = await db.teams.count_documents({})
    players_count = await db.players.count_documents({})
    matches_count = await db.matches.count_documents({})
    completed_matches = await db.matches.count_documents({"status": "completed"})
    
    return {
        "teams_count": teams_count,
        "players_count": players_count,
        "matches_count": matches_count,
        "completed_matches": completed_matches,
        "pending_matches": matches_count - completed_matches
    }

# ==================== Settings Routes ====================

@api_router.get("/settings")
async def get_settings(current_user: User = Depends(get_current_user)):
    settings = await db.settings.find_one({"id": "app_settings"}, {"_id": 0})
    if not settings:
        return {"id": "app_settings", "dashboard_logo": None, "footer_signature": None}
    return settings

@api_router.post("/settings")
async def update_settings(settings_data: AppSettings, current_user: User = Depends(get_admin_user)):
    settings_dict = settings_data.model_dump()
    settings_dict['updated_at'] = settings_dict['updated_at'].isoformat()
    
    await db.settings.update_one(
        {"id": "app_settings"},
        {"$set": settings_dict},
        upsert=True
    )
    return {"message": "Settings updated successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()