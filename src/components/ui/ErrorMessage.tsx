// components/ui/ErrorMessage.tsx
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export default function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry} className="mt-2">
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
