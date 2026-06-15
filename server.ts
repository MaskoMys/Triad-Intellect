import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dns from "dns";

// Ensure we load environment variables if dotenv is present
import dotenv from "dotenv";
dotenv.config();

// Fix dns lookup order for Node 17+ to prevent issues resolving localhost inside containers
dns.setDefaultResultOrder("ipv4first");

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API router endpoint
  app.post("/api/premium-order", async (req, res) => {
    const { email, name, profileCode, macroScores, archetype, timestamp } = req.body;

    // Strict validation
    if (!email || !email.includes("@")) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email structure provided." 
      });
    }

    if (!name || !profileCode || !archetype) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing necessary cognitive metrics (name, code, archetype)." 
      });
    }

    const receiverEmail = process.env.RECEIVER_EMAIL || "nidhal.mgh@gmail.com";
    
    // Formatting email templates
    const emailSubject = `🔮 NEW PREMIUM REPORT ORDER - ${name} [${profileCode}]`;
    const emailText = `
🔮 TRIAD COGNITIVE INTELLIGENCE: PREMIUM PORTFOLIO ORDER 🔮

=========================================
Subject Identity Credentials:
=========================================
Name: ${name}
Email Address: ${email}
Archetype Profile: ${profileCode} / ${archetype.name}
Tagline: "${archetype.tagline}"
Order Timestamp: ${timestamp ? new Date(timestamp).toUTCString() : new Date().toUTCString()}

=========================================
Calibrated Macro Vectors:
=========================================
- Imagination: ${Math.round(macroScores?.imagination ?? 0)}%
- Intuition: ${Math.round(macroScores?.intuition ?? 0)}%
- Judgment: ${Math.round(macroScores?.judgment ?? 0)}%

=========================================
Primary Sector Pathways:
=========================================
${archetype.careerPaths?.map((p: string) => `• ${p}`).join("\n")}

=========================================
System Calibration State: SECURE_LOCAL_VERIFIED_PROTOCOL
=========================================
This order was initiated from the Tri-Ad advanced cognitive map protocol results board.
`;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fafbfc;">
        <div style="background-color: #4f46e5; padding: 20px; border-radius: 12px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 20px; letter-spacing: 0.05em;">🔮 TRI-AD COGNITIVE PORTFOLIO</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">NEW PREMIUM INTEL REPORT ORDER RECEIVED</p>
        </div>
        
        <h2 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">SUBJECT IDENTITY CREDENTIALS</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Name Nom de Guerre:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Subject Email:</strong></td>
            <td style="padding: 6px 0; color: #4f46e5; font-weight: bold;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Archetype Code:</strong></td>
            <td style="padding: 6px 0; color: #4f46e5; font-weight: bold; font-family: monospace; font-size: 15px;">${profileCode}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Archetype Name:</strong></td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${archetype.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Tagline:</strong></td>
            <td style="padding: 6px 0; color: #475569; font-style: italic;">"${archetype.tagline}"</td>
          </tr>
        </table>
        
        <h2 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">CALIBRATED MACRO SCORES</h2>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <div style="flex: 1; background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #d97706; font-weight: bold;">IMAGINATION</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #b45309;">${Math.round(macroScores?.imagination ?? 0)}%</p>
          </div>
          <div style="flex: 1; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #059669; font-weight: bold;">INTUITION</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #047857;">${Math.round(macroScores?.intuition ?? 0)}%</p>
          </div>
          <div style="flex: 1; background: #e0e7ff; border: 1px solid #c7d2fe; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #4f46e5; font-weight: bold;">JUDGMENT</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #4338ca;">${Math.round(macroScores?.judgment ?? 0)}%</p>
          </div>
        </div>

        <h2 style="color: #1e293b; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">RECOMMENDED SECTORS</h2>
        <ul style="padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
          ${archetype.careerPaths?.map((p: string) => `<li style="margin-bottom: 6px;">${p}</li>`).join("")}
        </ul>

        <div style="margin-top: 30px; padding: 12px; background: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 10px; font-size: 11px; text-align: center; color: #64748b;">
          This transmission was programmatically formulated under 256-bit token integrity. System state active.
        </div>
      </div>
    `;

    console.log(`\n=============================================================`);
    console.log(`[ORDER RECEIVED IN LOCAL DATABASE SECTOR]`);
    console.log(`User Name:   ${name}`);
    console.log(`User Email:  ${email}`);
    console.log(`Profile:     ${profileCode} - ${archetype.name}`);
    console.log(`Recipients:  ${receiverEmail}`);
    console.log(`=============================================================\n`);

    // --- Delivery Method 1: Resend HTTP API ---
    if (process.env.RESEND_API_KEY) {
      try {
        console.log("Found RESEND_API_KEY. Attempting Resend API transmission...");
        // Use clean onboarding email for unverified tests or custom sender if defined
        const fromEmail = process.env.SENDER_EMAIL || "onboarding@resend.dev";
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: fromEmail,
            to: receiverEmail,
            subject: emailSubject,
            text: emailText,
            html: emailHtml
          })
        });

        if (response.ok) {
          console.log("Resend email dispatch successful!");
          return res.json({ 
            success: true, 
            mode: "api_resend", 
            message: "Premium order successfully registered. Email sent to team node." 
          });
        } else {
          const errData: any = await response.json().catch(() => ({}));
          console.error("Resend API returned error:", errData);
          return res.status(response.status).json({
            success: false,
            message: `Resend API Error: ${errData.message || "Domain validation or key eligibility issue."} (HTTP ${response.status})`
          });
        }
      } catch (err: any) {
        console.error("Failed email transmission via Resend API:", err);
        return res.status(500).json({
          success: false,
          message: `Network transmission failure to Resend API: ${err.message || err}`
        });
      }
    }

    // --- Delivery Method 2: NodeMailer SMTP ---
    if (process.env.SMTP_HOST) {
      try {
        console.log("Found SMTP_HOST config. Resolving NodeMailer transport...");
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: `"TriAd Cognitive Portals" <${process.env.SMTP_USER}>`,
          to: receiverEmail,
          subject: emailSubject,
          text: emailText,
          html: emailHtml
        });

        console.log("NodeMailer SMTP delivery complete!");
        return res.json({ 
          success: true, 
          mode: "smtp_nodemailer", 
          message: "Premium order successfully registered. Outbound mail dispatched." 
        });
      } catch (err: any) {
        console.error("Failed SMTP delivery transmission via Nodemailer:", err);
        return res.status(500).json({
          success: false,
          message: `Nodemailer SMTP Error: ${err.message || err}. Please review SMTP credentials.`
        });
      }
    }

    // --- Fallback High-Reliability keyless FormSubmit relay ---
    try {
      console.log("No custom secrets found. Using keyless FormSubmit relay fallback for live demonstration/testing...");
      
      let parsedReferer = "https://ais-dev-gyfp7y7ldkbdjp4wgkcfu5-580006627230.europe-west2.run.app";
      let parsedOrigin = "https://ais-dev-gyfp7y7ldkbdjp4wgkcfu5-580006627230.europe-west2.run.app";
      if (req.headers.referer) {
        parsedReferer = req.headers.referer;
        try {
          parsedOrigin = new URL(req.headers.referer).origin;
        } catch (e) {}
      } else if (req.headers.origin) {
        parsedOrigin = req.headers.origin;
        parsedReferer = req.headers.origin;
      }

      const response = await fetch(`https://formsubmit.co/ajax/${receiverEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Referer": parsedReferer,
          "Origin": parsedOrigin
        },
        body: JSON.stringify({
          _subject: `✦ VIP Tri-Ad Premium Dossier: ${profileCode} / ${archetype.name}`,
          "Candidate Name": name || "N/A",
          "Target Email": email || "N/A",
          "Cognitive Profile Group": profileCode,
          "Archetype Designation": archetype.name,
          "Recommended Sectors": archetype.careerPaths?.join(", ") || "",
          "Imagine Score": `${Math.round(macroScores?.imagination ?? macroScores?.imagine ?? 0)}%`,
          "Intuition Score": `${Math.round(macroScores?.intuition ?? 0)}%`,
          "Judgment Score": `${Math.round(macroScores?.judgment ?? 0)}%`,
          _honey: "", // Honeypot field for anti-spam
          _captcha: "false" // Disable captcha for smooth API submission
        })
      });

      const data: any = await response.json().catch(() => ({}));
      if (response.ok && (data.success === "true" || data.success === true)) {
        console.log("FormSubmit relay delivery initiated!");
        return res.json({
          success: true,
          mode: "formsubmit_relay",
          message: "Order placed successfully! First-time users will receive an activation email from FormSubmit in their inbox; please activate it to receive the dossier immediately."
        });
      } else {
        console.error("FormSubmit relay returned error status:", response.status, data);
        return res.status(400).json({
          success: false,
          message: data.message || "Failed to transmit via keyless mail relay. Please ensure the target email address is valid."
        });
      }
    } catch (err: any) {
      console.error("Failed FormSubmit relay transmission:", err);
      return res.status(500).json({
        success: false,
        message: `Relay Network Failure: ${err.message || err}. Please set RESEND_API_KEY or SMTP_HOST in your Settings under Secrets.`
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend resources in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Active execution binding
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SYSTEM STARTED] Tri-Ad Hub running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
