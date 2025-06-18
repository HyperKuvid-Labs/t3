import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Key } from 'lucide-react';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  modelName: string;
  provider: string;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  modelName,
  provider
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }
    
    // Basic validation for different providers
    if (provider === 'Anthropic' && !apiKey.startsWith('sk-ant-')) {
      setError('Claude API key should start with "sk-ant-"');
      return;
    }
    
    if (provider === 'DeepSeek' && !apiKey.startsWith('sk-')) {
      setError('DeepSeek API key should start with "sk-"');
      return;
    }

    onSubmit(apiKey);
    setApiKey('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setApiKey('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Required - {modelName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              To use {modelName} from {provider}, please enter your API key. 
              Your key will be stored securely in your browser's local storage.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${provider} API key`}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
