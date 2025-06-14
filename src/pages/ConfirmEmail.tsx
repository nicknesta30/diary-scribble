import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ConfirmEmail: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
    <Card className="max-w-md w-full text-center shadow-lg border-orange-100">
      <CardHeader>
        <CardTitle className="text-2xl">Confirm your email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-700">
          We just sent a confirmation link to your email address. Please click the link to
          verify your account before signing in.
        </p>
        <Link to="/">
          <Button className="bg-orange-500 hover:bg-orange-600 w-full">Back to Sign&nbsp;In</Button>
        </Link>
      </CardContent>
    </Card>
  </div>
);

export default ConfirmEmail;
