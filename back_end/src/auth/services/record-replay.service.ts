import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

// Define a type for authentication events
type AuthEvent = {
  password: string;
  email: string;
  type: 'login' | 'register';
  data: LoginDto | RegisterDto;
};

@Injectable()
export class RecordReplayService {
  private recordings: Map<string, AuthEvent[]> = new Map();

  // Record a login attempt
  recordLogin(sessionId: string, loginData: LoginDto): void {
    if (!this.recordings.has(sessionId)) {
      this.recordings.set(sessionId, []);
    }
    
    // Clone the login data to avoid reference issues
    const recordedLogin = { type: 'login', data: { ...loginData } } as AuthEvent;
    const sessionRecordings = this.recordings.get(sessionId);
    if (sessionRecordings) {
      sessionRecordings.push(recordedLogin);
    }
    
    console.log(`Recorded login for session ${sessionId}:`, recordedLogin.data);
  }
  
  // Record a registration attempt
  recordRegister(sessionId: string, registerData: RegisterDto): void {
    if (!this.recordings.has(sessionId)) {
      this.recordings.set(sessionId, []);
    }
    
    // Clone the registration data to avoid reference issues
    const recordedRegister = { type: 'register', data: { ...registerData } } as AuthEvent;
    const sessionRecordings = this.recordings.get(sessionId);
    if (sessionRecordings) {
      sessionRecordings.push(recordedRegister);
    }
    
    console.log(`Recorded registration for session ${sessionId}:`, recordedRegister.data);
  }

  // Get all login recordings for a session
  getLoginRecordings(sessionId: string): LoginDto[] {
    const allEvents = this.recordings.get(sessionId) || [];
    return allEvents
      .filter(event => event.type === 'login')
      .map(event => event.data as LoginDto);
  }
  
  // Get all registration recordings for a session
  getRegisterRecordings(sessionId: string): RegisterDto[] {
    const allEvents = this.recordings.get(sessionId) || [];
    return allEvents
      .filter(event => event.type === 'register')
      .map(event => event.data as RegisterDto);
  }

  // Get all recordings for a session
  getRecordings(sessionId: string): AuthEvent[] {
    return this.recordings.get(sessionId) || [];
  }

  // Get all session IDs
  getSessions(): string[] {
    return Array.from(this.recordings.keys());
  }

  // Clear recordings for a session
  clearRecordings(sessionId: string): void {
    this.recordings.delete(sessionId);
    console.log(`Cleared recordings for session ${sessionId}`);
  }
}
