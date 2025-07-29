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
  FormControl,
  FormLabel,
  Input,
  PinInput,
  PinInputField,
  HStack as PinHStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaSms, FaArrowLeft, FaPhone } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SMSLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/sms-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep('otp');
      toast({
        title: 'OTP Sent',
        description: `Verification code sent to ${phoneNumber}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // In development, show the OTP
      if (data.otp) {
        toast({
          title: 'Development Mode',
          description: `Your OTP is: ${data.otp}`,
          status: 'info',
          duration: 10000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('SMS login error:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      // Store token and redirect to dashboard
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast({
        title: 'Login Successful',
        description: 'Welcome to MedFayda!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    setError('');
    handleSendOTP();
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
              onClick={() => step === 'otp' ? setStep('phone') : router.push('/')}
            >
              {step === 'otp' ? 'Back to Phone' : 'Back to Home'}
            </Button>
          </HStack>

          {/* Login Card */}
          <Card w="full" shadow="lg">
            <CardBody p={8}>
              <VStack spacing={6}>
                {/* Header */}
                <VStack spacing={3} textAlign="center">
                  <Icon as={FaSms} boxSize={12} color="cyan.500" />
                  <Heading size="lg" color="blue.700">
                    SMS Login
                  </Heading>
                  <Text color="gray.600">
                    {step === 'phone' 
                      ? 'Enter your phone number to receive a verification code'
                      : 'Enter the 6-digit code sent to your phone'
                    }
                  </Text>
                </VStack>

                {/* Error Alert */}
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                {/* Phone Number Step */}
                {step === 'phone' && (
                  <VStack spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        type="tel"
                        placeholder="+251 9XX XXX XXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        leftElement={<Icon as={FaPhone} color="gray.400" ml={3} />}
                        size="lg"
                      />
                    </FormControl>

                    <Button
                      size="lg"
                      colorScheme="cyan"
                      w="full"
                      onClick={handleSendOTP}
                      isLoading={isLoading}
                      loadingText="Sending OTP..."
                    >
                      Send Verification Code
                    </Button>
                  </VStack>
                )}

                {/* OTP Verification Step */}
                {step === 'otp' && (
                  <VStack spacing={4} w="full">
                    <FormControl>
                      <FormLabel textAlign="center">
                        Verification Code sent to {phoneNumber}
                      </FormLabel>
                      <PinHStack justify="center" spacing={2}>
                        <PinInput
                          size="lg"
                          value={otp}
                          onChange={setOtp}
                          onComplete={handleVerifyOTP}
                        >
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                        </PinInput>
                      </PinHStack>
                    </FormControl>

                    <VStack spacing={2} w="full">
                      <Button
                        size="lg"
                        colorScheme="cyan"
                        w="full"
                        onClick={handleVerifyOTP}
                        isLoading={isLoading}
                        loadingText="Verifying..."
                        isDisabled={otp.length !== 6}
                      >
                        Verify & Login
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResendOTP}
                        isDisabled={isLoading}
                      >
                        Resend Code
                      </Button>
                    </VStack>
                  </VStack>
                )}

                {/* Alternative Login */}
                <VStack spacing={3} w="full" pt={4} borderTop="1px" borderColor="gray.200">
                  <Text fontSize="sm" color="gray.600">
                    Have a Fayda ID?
                  </Text>
                  <Button
                    variant="outline"
                    colorScheme="blue"
                    size="sm"
                    onClick={() => router.push('/auth/login')}
                  >
                    Login with Fayda ID
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
