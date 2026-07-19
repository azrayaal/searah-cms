import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NotFoundPage() {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-card bg-primary-100 text-primary"
        aria-hidden="true"
      >
        <FileQuestion className="h-7 w-7" />
      </div>

      <p className="mt-6 text-label uppercase text-gray-500">Error 404</p>
      <h1 className="mt-2 text-h3 text-gray-900">Page not found</h1>

      <p className="mx-auto mt-3 max-w-prose text-sm text-gray-500">
        The page you are looking for does not exist or has been moved.
      </p>

      <div className="mt-8 flex justify-center">
        <Link to="/">
          <Button variant="secondary" leadingIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
            Back to dashboard
          </Button>
        </Link>
      </div>
    </Card>
  );
}
