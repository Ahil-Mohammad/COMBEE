import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ChatInterface } from "./components/ChatInterface";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Authenticated>
        <ChatInterface />
      </Authenticated>
      
      <Unauthenticated>
        <div className="min-h-screen flex flex-col">
          <header className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-sm">🐝</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                </div>
                <h1 className="text-2xl font-bold">
                  COM<span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">BEE</span>
                </h1>
              </div>
            </div>
          </header>
          
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Welcome to COMBEE</h2>
                <p className="text-gray-400">Sequential AI processing for enhanced responses</p>
              </div>
              <SignInForm />
            </div>
          </main>
        </div>
      </Unauthenticated>
      
      <Toaster theme="dark" />
    </div>
  );
}
