'use client';

import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Button,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Send the authorization code to the backend
        const response = await fetch('http://localhost:5000/api/auth/fayda-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Authentication failed');
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setStatus('success');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (error: any) {
        console.error('Authentication callback error:', error);
        setError(error.message || 'Authentication failed');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md">
        <VStack spacing={6} textAlign="center">
          {status === 'loading' && (
            <>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Heading size="lg" color="blue.700">
                Completing Authentication
              </Heading>
              <Text color="gray.600">
                Please wait while we verify your Fayda ID credentials...
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <Box fontSize="4xl">✅</Box>
              <Heading size="lg" color="success.600">
                Authentication Successful!
              </Heading>
              <Text color="gray.600">
                Welcome to MedFayda! You will be redirected to your dashboard shortly.
              </Text>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="semibold">Authentication Failed</Text>
                  <Text fontSize="sm">{error}</Text>
                </VStack>
              </Alert>
              <VStack spacing={3}>
                <Button
                  colorScheme="blue"
                  onClick={() => router.push('/auth/login')}
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                >
                  Back to Home
                </Button>
              </VStack>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
