import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Academic themed colors
				algorithm: 'hsl(var(--algorithm-bg))',
				rule: 'hsl(var(--rule-bg))',
				derivation: 'hsl(var(--derivation-bg))',
				code: 'hsl(var(--code-bg))',
				highlight: 'hsl(var(--highlight))'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'card': 'var(--shadow-card)',
				'material-1': 'var(--shadow-material-1)',
				'material-2': 'var(--shadow-material-2)',
				'material-3': 'var(--shadow-material-3)'
			},
			fontFamily: {
				'sans': ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
				'serif': ['Roboto Slab', 'ui-serif', 'Georgia', 'serif'],
				'mono': ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
				'math': 'var(--math-font)',
				'code': 'var(--code-font)'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// Fade animations
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-scale': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				// Slide animations
				'slide-in-right': {
					'0%': { 
						transform: 'translateX(100%)',
						opacity: '0'
					},
					'100%': { 
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-in-left': {
					'0%': { 
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					'100%': { 
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				// Bounce animations
				'bounce-gentle': {
					'0%, 100%': {
						transform: 'translateY(-2%)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'50%': {
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
					}
				},
				// Pulse glow
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px hsl(var(--primary) / 0.3)'
					},
					'50%': {
						boxShadow: '0 0 40px hsl(var(--primary) / 0.6)'
					}
				},
				// Shake animation for errors
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
				},
				// Stagger animations
				'stagger-fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				// Loading animations
				'loading-shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'loading-dots': {
					'0%, 20%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.2)' },
					'80%, 100%': { transform: 'scale(1)' }
				},
				// Page transition animations
				'page-enter': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px) scale(0.98)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'page-exit': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(-20px) scale(0.98)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Fade animations
				'fade-in': 'fade-in 0.4s ease-out',
				'fade-in-up': 'fade-in-up 0.5s ease-out',
				'fade-in-scale': 'fade-in-scale 0.3s ease-out',
				// Slide animations
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'slide-in-left': 'slide-in-left 0.4s ease-out',
				// Interactive animations
				'bounce-gentle': 'bounce-gentle 1s infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'shake': 'shake 0.5s ease-in-out',
				// Stagger animations
				'stagger-1': 'stagger-fade-in 0.5s ease-out 0.1s both',
				'stagger-2': 'stagger-fade-in 0.5s ease-out 0.2s both',
				'stagger-3': 'stagger-fade-in 0.5s ease-out 0.3s both',
				'stagger-4': 'stagger-fade-in 0.5s ease-out 0.4s both',
				'stagger-5': 'stagger-fade-in 0.5s ease-out 0.5s both',
				// Loading animations
				'loading-shimmer': 'loading-shimmer 2s ease-in-out infinite',
				'loading-dots-1': 'loading-dots 1.4s ease-in-out infinite',
				'loading-dots-2': 'loading-dots 1.4s ease-in-out 0.2s infinite',
				'loading-dots-3': 'loading-dots 1.4s ease-in-out 0.4s infinite',
				// Page transitions
				'page-enter': 'page-enter 0.4s ease-out',
				'page-exit': 'page-exit 0.3s ease-in'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
