import { User } from "@shared/schema";
import { storage } from "./storage";
import crypto from "crypto";

// This is a mock email service for demonstration
// In a production environment, you would use a real email service
// like SendGrid, Mailgun, etc.

export interface EmailResult {
  success: boolean;
  message: string;
}

export async function sendVerificationEmail(user: User): Promise<EmailResult> {
  try {
    // Generate a random 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    
    // Store the code in the database
    await storage.createVerificationCode({
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes
    });
    
    // Update the user record with the verification code
    await storage.updateUser(user.id, { verificationCode: code });
    
    console.log(`
      ===== VERIFICATION EMAIL =====
      To: ${user.email}
      Subject: Verify your email for HomeDirect
      
      Hello ${user.firstName},
      
      Thank you for registering with HomeDirect!
      
      Your verification code is: ${code}
      
      Please use this code to verify your email address.
      This code will expire in 30 minutes.
      
      If you did not create an account, please ignore this email.
      
      Best regards,
      The HomeDirect Team
      =============================
    `);
    
    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}
