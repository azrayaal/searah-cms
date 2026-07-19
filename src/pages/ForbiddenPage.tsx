import { ArrowLeft, ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ForbiddenPage() {
  return (
    <Card className="mx-auto max-w-xl text-center">
      {/*
        Warning rather than burgundy: burgundy is reserved for errors the user caused
        and can fix. A permission boundary is neither — it is the system working.
      */}
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-card bg-warning-100 text-warning"
        aria-hidden="true"
      >
        <ShieldOff className="h-7 w-7" />
      </div>

      <p className="mt-6 text-label uppercase text-gray-500">Error 403</p>
      <h1 className="mt-2 text-h3 text-gray-900">You do not have access to this area</h1>

      <p className="mx-auto mt-3 max-w-prose text-sm text-gray-500">
        Your role does not include permission for this module. Contact a portal administrator if you
        believe this is a mistake.
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
