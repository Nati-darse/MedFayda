'use client';

import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Icon,
  HStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFaydaLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Call backend to get authorization URL
      const response = await fetch('http://localhost:5000/api/auth/fayda-auth', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Fayda ID authentication');
      }

      const data = await response.json();
      
      // Redirect to Fayda ID authorization server
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Fayda login error:', error);
      setError('Failed to connect to Fayda ID. Please try again.');
      toast({
        title: 'Authentication Error',
        description: 'Failed to connect to Fayda ID. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Back Button */}
          <HStack w="full" justify="flex-start">
            <Button
              leftIcon={<Icon as={FaArrowLeft} />}
              variant="ghost"
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
          </HStack>

          {/* Login Card */}
          <Card w="full" shadow="lg">
            <CardBody p={8}>
              <VStack spacing={6}>
                {/* Header */}
                <VStack spacing={3} textAlign="center">
                  <Icon as={FaShieldAlt} boxSize={12} color="blue.500" />
                  <Heading size="lg" color="blue.700">
                    Login to MedFayda
                  </Heading>
                  <Text color="gray.600">
                    Secure access with your Fayda ID
                  </Text>
                </VStack>

                {/* Error Alert */}
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                {/* Login Button */}
                <VStack spacing={4} w="full">
                  <Button
                    size="lg"
                    colorScheme="blue"
                    w="full"
                    onClick={handleFaydaLogin}
                    isLoading={isLoading}
                    loadingText="Connecting to Fayda ID..."
                    leftIcon={!isLoading ? <Icon as={FaShieldAlt} /> : undefined}
                  >
                    {isLoading ? <Spinner size="sm" /> : 'Login with Fayda ID'}
                  </Button>

                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    You will be redirected to the official Fayda ID login page
                  </Text>
                </VStack>

                {/* Alternative Login */}
                <VStack spacing={3} w="full" pt={4} borderTop="1px" borderColor="gray.200">
                  <Text fontSize="sm" color="gray.600">
                    Having trouble with Fayda ID?
                  </Text>
                  <Button
                    variant="outline"
                    colorScheme="blue"
                    size="sm"
                    onClick={() => router.push('/auth/sms-login')}
                  >
                    Use SMS Login Instead
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Security Notice */}
          <Card w="full" bg="blue.50" borderColor="blue.200">
            <CardBody p={4}>
              <VStack spacing={2} textAlign="center">
                <Text fontSize="sm" fontWeight="semibold" color="blue.800">
                  🔒 Secure Authentication
                </Text>
                <Text fontSize="xs" color="blue.700">
                  Your login is protected by government-grade security through Fayda ID.
                  We never store your Fayda ID credentials.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
