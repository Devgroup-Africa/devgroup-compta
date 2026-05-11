import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (emailData: { recipientEmail: string; subject: string; message: string }) => Promise<void>;
  defaultEmail?: string;
  defaultSubject?: string;
  defaultMessage?: string;
  title?: string;
  description?: string;
}

const EmailDialog = ({
  open, 
  onOpenChange,
  onSend,
  defaultEmail = "",
  defaultSubject = "",
  defaultMessage = "",
  title = "Envoyer par email",
  description = "Envoyez ce document par email"
}: EmailDialogProps) => {
  const [emailData, setEmailData] = useState({
    recipientEmail: defaultEmail,
    subject: defaultSubject,
    message: defaultMessage
  });
  const [sending, setSending] = useState(false);

  // Update email data when defaults change or dialog opens
  useEffect(() => {
    if (open) {
      setEmailData({
        recipientEmail: defaultEmail,
        subject: defaultSubject,
        message: defaultMessage
      });
    }
  }, [open, defaultEmail, defaultSubject, defaultMessage]);

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend(emailData);
      onOpenChange(false);
      setEmailData({ recipientEmail: "", subject: "", message: "" });
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email du destinataire *</Label>
            <Input
              id="email"
              type="email"
              value={emailData.recipientEmail}
              onChange={(e) => setEmailData({ ...emailData, recipientEmail: e.target.value })}
              placeholder="client@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Objet *</Label>
            <Input
              id="subject"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              placeholder="Objet de l'email..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              placeholder="Votre message..."
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Annuler
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !emailData.recipientEmail || !emailData.subject}
          >
            {sending ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDialog;
