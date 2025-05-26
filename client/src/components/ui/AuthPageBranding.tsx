import React from "react";
import {
  HeartOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Typography } from "antd";
import logo from '../../assets/bccancer_foundation_rgb.png';

<img src={logo} alt="BC Cancer Logo" />


const { Title, Text } = Typography;

export const AuthPageBranding: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1e1e2f] via-[#2c2c40] to-[#3a3a50] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-white rounded-full animate-pulse delay-75"></div>
        <div className="absolute bottom-40 left-32 w-40 h-40 bg-white rounded-full animate-pulse delay-150"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full animate-pulse delay-300"></div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
        <div className="absolute top-20 left-20 w-8 h-8 bg-white/40 rounded-full"></div>
        <div className="absolute bottom-30 right-45 w-3 h-3 bg-white/60 rounded-full"></div>
        <div className="text-center space-y-10 max-w-lg">
          {/* Logo */}
          <div className="flex flex-col items-start justify-start mb-12">
            {/* Logo */}
            <img src={logo} alt="BC Cancer Logo" className="w-70 mb-4" />
            {/* <HeartOutlined className="text-5xl text-white/80" /> */}
            <div className="backdrop-blur-lg rounded-2xl px-6 py-3 inline-block text-white/90 font-semibold text-sm tracking-wide">
              MANAGEMENT PLATFORM
              <span className="ml-2 p-1 bg-white text-black px-2 rounded-full">
                Version 2.1.0
              </span>
            </div>
          </div>
          <div className="relative mb-0">
          </div>

          {/* Title and Version */}
          <div className="space-y-6">
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
              <div className="flex items-center space-x-3">
                <SafetyCertificateOutlined className="text-2xl text-[#a5b4fc]" />
                <span className="text-white/90 font-medium">Secure & Compliant</span>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-white/30 to-transparent mx-auto rounded-full"></div>

              <div className="flex items-center space-x-3">
                <ExperimentOutlined className="text-2xl text-[#c4b5fd]" />
                <span className="text-white/90 font-medium">Research Focused</span>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-white/30 to-transparent mx-auto rounded-full"></div>

              <div className="flex items-center space-x-3">
                <TeamOutlined className="text-2xl text-[#a5f3fc]" />
                <span className="text-white/90 font-medium">Team Collaboration</span>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-white/30 to-transparent mx-auto rounded-full"></div>
            </div>

            <span className="text-white/70 text-base leading-relaxed max-w-md block">
              Empowering healthcare professionals with intuitive tools for collaboration — unified under one reliable platform.
            </span>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white/90">50K+</div>
              <div className="text-white/50 text-sm">Patients Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white/90">1.2K+</div>
              <div className="text-white/50 text-sm">Healthcare Staff</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white/90">24/7</div>
              <div className="text-white/50 text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white to-transparent opacity-5 rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-white to-transparent opacity-5 rounded-full translate-y-40 -translate-x-40"></div>
    </div>
  );
};

export default AuthPageBranding;
