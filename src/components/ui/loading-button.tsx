
import { Button, ButtonProps } from "@/components/ui/button";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton = ({ 
  loading = false, 
  loadingText, 
  children, 
  disabled,
  className,
  ...props 
}: LoadingButtonProps) => {
  return (
    <Button 
      disabled={disabled || loading} 
      className={cn(className)}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};
