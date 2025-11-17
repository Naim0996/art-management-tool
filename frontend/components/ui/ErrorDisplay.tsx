import { Message } from 'primereact/message';

interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  className?: string;
}

export default function ErrorDisplay({ 
  error, 
  title = 'Error',
  className = '' 
}: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`p-4 ${className}`}>
      <Message 
        severity="error" 
        text={
          <div>
            <strong>{title}</strong>
            <p className="mt-2">{errorMessage}</p>
          </div>
        }
      />
    </div>
  );
}
