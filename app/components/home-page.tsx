'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowRight,
  Star
} from 'lucide-react'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      title: "Interactive Courses",
      description: "Comprehensive video-based learning with progress tracking and interactive content designed for student success.",
      number: "01"
    },
    {
      title: "Study Together",
      description: "Collaborate with fellow students, share knowledge, and build lasting connections in a supportive learning environment.",
      number: "02"
    },
    {
      title: "Past Papers & Resources",
      description: "Access practice tests, study materials, and exam resources to help you prepare effectively for your assessments.",
      number: "03"
    }
  ]

  const stats = [
    { number: "Free", label: "Access" },
    { number: "Expert", label: "Lectures" },
    { number: "Global", label: "Community" },
    { number: "Students", label: "Worldwide" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Hidden on mobile */}
      <nav className="hidden sm:block fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="KnightED"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xl font-subheading text-gray-900">KnightED</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up">
                <Button className="bg-gold text-gold-foreground hover:bg-gold/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-6 sm:pt-24 pb-24 px-4 sm:px-8 lg:px-8 bg-gradient-to-b from-white to-gray-50/50 relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200/40" />
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading text-gray-900 mb-6 leading-[0.9]">
              Learn together,
              <br />
              <span className="text-gray-600">grow together</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl font-body text-gray-700 mb-16 max-w-2xl mx-auto leading-relaxed px-2">
              Access expert lectures from senior students,
              <br className="hidden sm:block" />
              shared resources, and study materials.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16">
              <Link href="/sign-up">
                <Button 
                  size="lg" 
                  className="bg-gold text-gold-foreground hover:bg-gold/90 px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200"
                >
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/sign-in">
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="text-gray-600 hover:text-gray-900 px-8 py-3 text-lg font-medium"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center transition-all duration-1000 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                >
                  <div className="text-xl sm:text-3xl font-subheading text-gray-900 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm font-body text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-32 bg-gray-50/50 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gray-200/60" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200/40" />
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-8">
          <div className="text-center mb-16 sm:mb-28">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-subheading-light text-gray-900 mb-8">
              Built for students,
              <br className="sm:hidden" />
              by students
            </h2>
            <p className="text-base sm:text-lg font-body text-gray-700 max-w-2xl mx-auto px-2">
              Everything you need to excel in your studies, all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="mb-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-gray-900 transition-all duration-300">
                    <span className="text-2xl font-subheading text-gray-600 group-hover:text-white transition-colors duration-300">
                      {feature.number}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-subheading text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 font-body leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 sm:py-32 bg-gradient-to-b from-gray-100/60 to-white relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gray-200/60" />
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-20 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-subheading-light text-gray-900 mb-8">
                Learn from senior
                <br className="sm:hidden" />
                {" "}students
              </h2>
              <p className="text-base sm:text-lg font-body text-gray-700 mb-10 leading-relaxed">
                Access high-quality lectures and study materials created by experienced senior students.
                Get the knowledge you need to excel in your studies.
              </p>
              
              <div className="space-y-8">
                <div className="space-y-8">
                  <div>
                    <h3 className="font-subheading text-gray-900 mb-3">Expert Lectures</h3>
                    <p className="text-gray-600 text-sm font-body">Watch high-quality lectures from senior students</p>
                  </div>
                  
                  <div>
                    <h3 className="font-subheading text-gray-900 mb-3">Q&A Sessions</h3>
                    <p className="text-gray-600 text-sm font-body">Ask questions and get answers from experts</p>
                  </div>
                  
                  <div>
                    <h3 className="font-subheading text-gray-900 mb-3">Study Materials</h3>
                    <p className="text-gray-600 text-sm font-body">Access notes, past papers, and resources</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-10 border border-gray-200 shadow-sm">
                <div className="text-center">
                  <div className="mb-8">
                    <h3 className="text-2xl font-subheading text-gray-900 mb-2">Join students worldwide</h3>
                    <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
                  </div>
                  
                  <blockquote className="text-lg text-gray-700 mb-10 font-body leading-relaxed max-w-2xl mx-auto">
                    &ldquo;This platform has completely transformed how I learn. The quality of content from senior students is incredible, and the community support is amazing. This is THE FUTURE of education!&rdquo;
                  </blockquote>

                  <div className="flex flex-col items-center justify-center">
                    <div className="flex space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="font-subheading text-gray-900 text-lg">Muhammad Rayyan</p>
                      <p className="text-sm text-gray-500 font-body">Computer Science Student</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
