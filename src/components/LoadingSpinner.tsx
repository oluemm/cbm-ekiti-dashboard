interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = 'Loading data…',
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
}
