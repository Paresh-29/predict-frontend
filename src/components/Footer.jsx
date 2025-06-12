import { Link } from "react-router-dom";
import { Github, Mail, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t py-10 mt-16">
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3 text-sm text-muted-foreground">
        {/* Branding / About */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-2">
            Stock Vision
          </h3>
          <p>
            Predict short-term trends with LSTM or explore long-term insights
            through Agentic AI. Data-driven, intelligent forecasting for every
            investor.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-foreground mb-2">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/lstm" className="hover:underline">
                Short-Term (LSTM)
              </Link>
            </li>
            <li>
              <Link to="/agentic-ai" className="hover:underline">
                Long-Term (AI)
              </Link>
            </li>
            <li>
              <a
                href="mailto:contact@stockvision.ai"
                className="hover:underline"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Social / Contact */}
        <div>
          <h4 className="font-semibold text-foreground mb-2">Stay Connected</h4>
          <div className="flex gap-4 items-center">
            <a
              href="https://github.com/your-username"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:contact@stockvision.ai"
              className="hover:text-foreground"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/your-profile"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-xs mt-10 text-muted-foreground">
        © {new Date().getFullYear()} Stock Vision. All rights reserved.
      </div>
    </footer>
  );
}
