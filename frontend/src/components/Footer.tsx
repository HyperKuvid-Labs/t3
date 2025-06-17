
import { Button } from '@/components/ui/button';
import { Github, Mail, FileText, Info } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neon-dark/50 border-t border-neon-blue/20 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-neon-blue">Gideon</h3>
            <p className="text-sm text-neon-muted">
              AI-powered chat platform for collaborative conversations and project building.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-neon-text">Platform</h4>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="h-auto p-0 text-neon-muted hover:text-neon-text">
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-neon-muted hover:text-neon-text">
                <FileText className="w-4 h-4 mr-2" />
                Documentation
              </Button>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-neon-text">Connect</h4>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="h-auto p-0 text-neon-muted hover:text-neon-text">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-neon-muted hover:text-neon-text">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>

          {/* Version */}
          <div className="space-y-3">
            <h4 className="font-semibold text-neon-text">Version</h4>
            <div className="text-sm text-neon-muted">
              <p>Gideon v1.0.0</p>
              <p>Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-neon-blue/20 mt-8 pt-6 text-center">
          <p className="text-sm text-neon-muted">
            © 2024 Gidvion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
