'use client';

import { Box, Container, Heading, Text, VStack, Button, HStack, Icon } from '@chakra-ui/react';
import { FaHeartbeat, FaUserMd, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="7xl" py={20}>
        <VStack spacing={12} textAlign="center">
          {/* Hero Section */}
          <VStack spacing={6}>
            <HStack spacing={3}>
              <Icon as={FaHeartbeat} boxSize={12} color="blue.500" />
              <Heading size="2xl" color="blue.700">
                MedFayda
              </Heading>
            </HStack>
            <Heading size="lg" color="gray.600" maxW="2xl">
              Secure Health Record Access System for Ethiopia
            </Heading>
            <Text fontSize="xl" color="gray.500" maxW="3xl">
              Unified health records linked to Fayda IDs with real-time access for doctors
              and secure, nationwide scalability.
            </Text>
          </VStack>

          {/* Features */}
          <HStack spacing={8} flexWrap="wrap" justify="center">
            <VStack spacing={3} p={6} bg="white" rounded="lg" shadow="md" minW="200px">
              <Icon as={FaShieldAlt} boxSize={8} color="blue.500" />
              <Text fontWeight="bold">Fayda ID Integration</Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Government-backed identity verification
              </Text>
            </VStack>
            <VStack spacing={3} p={6} bg="white" rounded="lg" shadow="md" minW="200px">
              <Icon as={FaUserMd} boxSize={8} color="cyan.500" />
              <Text fontWeight="bold">Unified Records</Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Complete medical history in one place
              </Text>
            </VStack>
            <VStack spacing={3} p={6} bg="white" rounded="lg" shadow="md" minW="200px">
              <Icon as={FaCalendarAlt} boxSize={8} color="green.500" />
              <Text fontWeight="bold">Smart Reminders</Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Never miss appointments or medications
              </Text>
            </VStack>
          </HStack>

          {/* CTA Buttons */}
          <HStack spacing={4} flexWrap="wrap" justify="center">
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => router.push('/auth/login')}
              px={8}
            >
              Login with Fayda ID
            </Button>
            <Button
              size="lg"
              variant="outline"
              colorScheme="blue"
              onClick={() => router.push('/auth/sms-login')}
              px={8}
            >
              SMS Login
            </Button>
          </HStack>

          {/* Footer */}
          <Text fontSize="sm" color="gray.500" mt={12}>
            Built for Ethiopia's healthcare system with security and accessibility in mind
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
