# Animation Libraries for React

Here's a list of animation libraries that can help you create beautiful wave animations and other effects similar to ElevenLabs:

## 1. React Wavify

**Description**: A simple React component that creates animated wave effects, which we're currently using in our project.

**Features**:
- Creates smooth, animated wave effects
- Customizable height, amplitude, speed, and points
- Lightweight and easy to use
- Perfect for creating background wave animations like ElevenLabs

**Installation**: `npm install react-wavify --legacy-peer-deps`

**Usage Example**:
```jsx
import Wave from 'react-wavify';

const WaveComponent = () => (
  <Wave 
    fill='rgba(59, 130, 246, 0.2)'
    paused={false}
    options={{
      height: 40,
      amplitude: 40,
      speed: 0.15,
      points: 3
    }}
  />
);
```

## 2. Framer Motion

**Description**: A production-ready motion library for React that powers animations in Framer.

**Features**:
- Easy-to-use syntax for creating stunning animations
- Supports a wide range of elements and UI components
- Customizable options for fine-tuning animations
- Gesture support for interactive interactions
- Built-in SVG animation capabilities
- Variant system for creating reusable animations

**Installation**: `npm install framer-motion`

**Usage Example**:
```jsx
import { motion } from 'framer-motion';

const AnimatedComponent = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    Hello World
  </motion.div>
);
```

## 3. React Spring

**Description**: A spring-physics-based animation library for React applications.

**Features**:
- Smooth and fluid animations based on spring physics
- Natural and realistic effects
- Fine-grained control over animation parameters
- Supports complex animations involving multiple elements
- Seamless integration with React
- Cross-browser and cross-device compatibility

**Installation**: `npm install react-spring`

**Usage Example**:
```jsx
import { useSpring, animated } from 'react-spring';

const AnimatedComponent = () => {
  const props = useSpring({ 
    from: { opacity: 0, transform: 'translateY(20px)' }, 
    to: { opacity: 1, transform: 'translateY(0)' } 
  });
  
  return <animated.div style={props}>Hello World</animated.div>;
};
```

## 4. TS Particles

**Description**: Create highly customizable particle animations, confetti, and fireworks.

**Features**:
- Stunning particle animations for visually captivating websites
- Customizable configurations for size, shape, color, and behavior of particles
- Interactive interactions with mouse and touch
- Performance optimization for smooth animations on all devices
- Easy integration with React

**Installation**: `npm install tsparticles react-tsparticles`

**Usage Example**:
```jsx
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const ParticlesComponent = () => {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          color: {
            value: "#0d47a1",
          },
        },
        particles: {
          number: {
            value: 80,
          },
          color: {
            value: "#ffffff",
          },
          links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
          },
          move: {
            enable: true,
          },
        },
      }}
    />
  );
};
```

## 5. GreenSock (GSAP)

**Description**: A professional-grade animation library for the modern web.

**Features**:
- Extremely powerful and flexible animation capabilities
- High-performance animations with minimal impact on browser resources
- Cross-browser compatibility
- Extensive plugin ecosystem for specialized animations
- Timeline feature for complex, sequenced animations

**Installation**: `npm install gsap`

**Usage Example**:
```jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const GsapComponent = () => {
  const boxRef = useRef();
  
  useEffect(() => {
    gsap.to(boxRef.current, { 
      rotation: 360, 
      duration: 2, 
      ease: "power2.inOut" 
    });
  }, []);
  
  return <div ref={boxRef}>Hello World</div>;
};
```

## 6. React Awesome Reveal

**Description**: React Awesome Reveal offers reveal animations by utilizing the Intersection Observer API.

**Features**:
- Scroll-triggered animations for captivating reveal effects
- Variety of animation options: fades, slides, zooms, rotations, and more
- Customization and control over animation properties
- Sequential animations for cascading or staggered effects
- Integration with Intersection Observer for efficient tracking

**Installation**: `npm install react-awesome-reveal`

**Usage Example**:
```jsx
import { Fade, Slide, Zoom } from "react-awesome-reveal";

const RevealComponent = () => (
  <div>
    <Fade>
      <h1>This will fade in</h1>
    </Fade>
    <Slide>
      <p>This will slide in</p>
    </Slide>
    <Zoom>
      <button>This will zoom in</button>
    </Zoom>
  </div>
);
```

## Creating ElevenLabs-Style Wave Animations

To create wave animations similar to ElevenLabs, you can combine these libraries. For example:

1. Use React Wavify for the main wave background
2. Add Framer Motion for smooth transitions and interactions
3. Consider TS Particles for additional particle effects
4. Use GSAP for more complex, custom animations

The key to achieving the ElevenLabs look is layering multiple waves with different speeds, amplitudes, and opacities to create depth and movement. 