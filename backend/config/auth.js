const { BetterAuth } = require('better-auth');
const { oauth } = require('@better-auth/oauth');
const { session } = require('@better-auth/session');

// BetterAuth configuration for MedFayda
const auth = new BetterAuth({
  // Database configuration
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    options: {
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  },

  // Session configuration
  session: {
    cookieName: 'medfayda-session',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  },

  // User configuration
  user: {
    fields: {
      email: 'email',
      name: 'name',
      image: 'avatar',
      // Custom fields for MedFayda
      faydaId: 'fayda_id',
      fin: 'fin',
      role: 'role',
      phoneNumber: 'phone_number',
      healthCenterId: 'health_center_id',
      licenseNumber: 'license_number',
      specialization: 'specialization'
    },
    additionalFields: {
      firstName: {
        type: 'string',
        required: true
      },
      lastName: {
        type: 'string',
        required: true
      },
      dateOfBirth: {
        type: 'date',
        required: false
      },
      gender: {
        type: 'string',
        required: false
      },
      isActive: {
        type: 'boolean',
        default: true
      },
      lastLogin: {
        type: 'date',
        required: false
      }
    }
  },

  // Plugins
  plugins: [
    oauth({
      providers: {
        // Fayda ID OIDC Provider
        faydaId: {
          clientId: process.env.FAYDA_CLIENT_ID,
          clientSecret: process.env.FAYDA_CLIENT_SECRET,
          issuer: process.env.FAYDA_ISSUER_URL || 'https://auth.fayda.gov.et',
          scope: 'openid profile email fin',
          authorizationParams: {
            response_type: 'code',
            access_type: 'offline'
          },
          userInfoEndpoint: 'https://auth.fayda.gov.et/userinfo',
          profile: (profile) => ({
            id: profile.sub,
            email: profile.email,
            name: `${profile.given_name} ${profile.family_name}`,
            firstName: profile.given_name,
            lastName: profile.family_name,
            faydaId: profile.sub,
            fin: profile.fin,
            phoneNumber: profile.phone_number,
            dateOfBirth: profile.birthdate,
            gender: profile.gender,
            role: profile.role || 'patient'
          })
        },

        // SMS/Phone Provider (custom implementation)
        sms: {
          type: 'custom',
          name: 'SMS Login',
          sendOTP: async (phoneNumber) => {
            // Implement SMS sending logic here
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`SMS OTP for ${phoneNumber}: ${otp}`);
            
            // Store OTP in cache/database for verification
            // In production, integrate with SMS service like Twilio
            return { success: true, otp: process.env.NODE_ENV === 'development' ? otp : undefined };
          },
          verifyOTP: async (phoneNumber, otp) => {
            // Implement OTP verification logic
            // For development, accept any 6-digit OTP
            if (otp.length === 6) {
              return {
                success: true,
                user: {
                  phoneNumber,
                  fin: `SMS${phoneNumber.replace(/\D/g, '').slice(-9)}`,
                  firstName: 'SMS',
                  lastName: 'User',
                  role: 'patient'
                }
              };
            }
            return { success: false, error: 'Invalid OTP' };
          }
        }
      }
    }),

    session({
      storage: 'database' // Store sessions in database
    })
  ],

  // Security settings
  security: {
    csrf: {
      enabled: true,
      cookieName: 'medfayda-csrf'
    },
    rateLimit: {
      enabled: true,
      max: 100, // requests per window
      windowMs: 15 * 60 * 1000 // 15 minutes
    }
  },

  // Callbacks
  callbacks: {
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      console.log('User signing in:', user.email || user.phoneNumber);
      
      // Update last login
      if (user.id) {
        // Update user's last login timestamp
        // This will be handled by the database automatically
      }
      
      return true;
    },

    async session({ session, user }) {
      // Add custom fields to session
      if (user) {
        session.user.role = user.role;
        session.user.fin = user.fin;
        session.user.healthCenterId = user.healthCenterId;
        session.user.specialization = user.specialization;
      }
      return session;
    },

    async jwt({ token, user, account }) {
      // Add custom fields to JWT
      if (user) {
        token.role = user.role;
        token.fin = user.fin;
        token.healthCenterId = user.healthCenterId;
      }
      return token;
    }
  },

  // Error handling
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    newUser: '/auth/welcome'
  }
});

module.exports = auth;
