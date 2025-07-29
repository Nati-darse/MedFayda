'use client';

import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Grid,
  GridItem,
  Badge,
  Avatar,
  useToast,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import {
  FaUser,
  FaCalendarAlt,
  FaFileAlt,
  FaBell,
  FaSignOutAlt,
  FaHeartbeat,
  FaUserMd,
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  faydaId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    router.push('/');
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl" py={4}>
          <Flex align="center">
            <HStack spacing={3}>
              <Icon as={FaHeartbeat} boxSize={8} color="cyan.500" />
              <Heading size="lg" color="blue.700">
                MedFayda
              </Heading>
            </HStack>
            <Spacer />
            <HStack spacing={4}>
              <HStack spacing={2}>
                <Avatar size="sm" name={`${user.firstName} ${user.lastName}`} />
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" fontWeight="semibold">
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user.role}
                  </Text>
                </VStack>
              </HStack>
              <Button
                leftIcon={<Icon as={FaSignOutAlt} />}
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Welcome Section */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="start">
                <Heading size="lg">
                  Welcome back, {user.firstName}!
                </Heading>
                <Text color="gray.600">
                  Here's an overview of your health information and upcoming appointments.
                </Text>
                <HStack spacing={4}>
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                    Fayda ID: {user.faydaId}
                  </Badge>
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
            <GridItem>
              <Card h="full" cursor="pointer" _hover={{ shadow: 'md' }}>
                <CardBody textAlign="center">
                  <VStack spacing={3}>
                    <Icon as={FaUser} boxSize={8} color="blue.500" />
                    <Text fontWeight="semibold">My Profile</Text>
                    <Text fontSize="sm" color="gray.600">
                      View and update your personal information
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card h="full" cursor="pointer" _hover={{ shadow: 'md' }}>
                <CardBody textAlign="center">
                  <VStack spacing={3}>
                    <Icon as={FaFileAlt} boxSize={8} color="cyan.500" />
                    <Text fontWeight="semibold">Health Records</Text>
                    <Text fontSize="sm" color="gray.600">
                      Access your complete medical history
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card h="full" cursor="pointer" _hover={{ shadow: 'md' }}>
                <CardBody textAlign="center">
                  <VStack spacing={3}>
                    <Icon as={FaCalendarAlt} boxSize={8} color="green.500" />
                    <Text fontWeight="semibold">Appointments</Text>
                    <Text fontSize="sm" color="gray.600">
                      Schedule and manage appointments
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card h="full" cursor="pointer" _hover={{ shadow: 'md' }}>
                <CardBody textAlign="center">
                  <VStack spacing={3}>
                    <Icon as={FaBell} boxSize={8} color="orange.500" />
                    <Text fontWeight="semibold">Reminders</Text>
                    <Text fontSize="sm" color="gray.600">
                      Medication and checkup reminders
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Recent Activity */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            <GridItem>
              <Card>
                <CardHeader>
                  <Heading size="md">Recent Health Records</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text color="gray.500" textAlign="center" py={8}>
                      No recent health records found.
                      <br />
                      Your medical visits will appear here.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card>
                <CardHeader>
                  <Heading size="md">Upcoming Appointments</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text color="gray.500" textAlign="center" py={8}>
                      No upcoming appointments.
                      <br />
                      Schedule your next visit.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
}
