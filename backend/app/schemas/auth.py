"""Authentication schemas using Pydantic v2."""
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration."""
    
    email: EmailStr
    password: str
    confirm_password: Optional[str] = None
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password meets requirements."""
        # Check for empty or whitespace-only passwords
        if not v or not v.strip():
            raise ValueError("Password cannot be empty or whitespace only")
        
        # Check minimum length
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        return v
    
    @model_validator(mode="after")
    def validate_passwords_match(self) -> "UserCreate":
        """Validate that passwords match if confirm_password is provided."""
        if self.confirm_password is not None and self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserLogin(BaseModel):
    """Schema for user login."""
    
    email: EmailStr
    password: str
    
    @field_validator("password")
    @classmethod
    def validate_password_not_empty(cls, v: str) -> str:
        """Validate password is not empty."""
        if not v or not v.strip():
            raise ValueError("Password cannot be empty")
        return v


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    """Schema for simple message responses."""
    
    message: str
    success: bool = True
