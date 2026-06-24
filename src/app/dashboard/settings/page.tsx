"use client"

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useProfile, useUpdateProfile } from '@/lib/hooks/useProfile'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { User, Shield, Palette, Settings } from 'lucide-react'

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile()
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()
  
  const [name, setName] = useState('')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name)
    }
  }, [profile])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({ name })
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-gray-500 font-medium">Loading settings...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Settings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full animate-in fade-in duration-700">
        <TabsList className="mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 inline-flex flex-wrap gap-1">
          <TabsTrigger 
            value="profile" 
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 text-gray-600 dark:text-gray-400 font-semibold transition-all flex items-center"
          >
            <User className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger 
            value="appearance" 
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 text-gray-600 dark:text-gray-400 font-semibold transition-all flex items-center"
          >
            <Palette className="w-4 h-4 mr-2" /> Appearance
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 text-gray-600 dark:text-gray-400 font-semibold transition-all flex items-center"
          >
            <Shield className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your photo and personal details here.</p>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
                <Input 
                  id="email" 
                  value={profile?.email || ''} 
                  disabled 
                  className="h-11 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-70" 
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Your email is managed by your organization.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="font-semibold text-gray-700 dark:text-gray-300">Role</Label>
                <Input 
                  id="role" 
                  value={profile?.role?.replace('_', ' ').toUpperCase() || ''} 
                  disabled 
                  className="h-11 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-70 font-semibold text-indigo-600 dark:text-indigo-400" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-gray-700 dark:text-gray-300">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Enter your full name"
                  className="h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button 
                  type="submit" 
                  disabled={isPending || name === profile?.name}
                  className="rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all hover:scale-105 px-6"
                >
                  {isPending ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize how MoonVeil Workspace looks on your device.</p>
            </div>
            
            <div className="max-w-xl">
              <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                <div className="space-y-1">
                  <Label className="text-base font-bold text-gray-900 dark:text-white">Dark Mode</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Switch between light and dark themes.</p>
                </div>
                <Switch 
                  checked={mounted ? theme === 'dark' : false}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your password and security settings.</p>
            </div>
            
            <div className="max-w-xl space-y-6">
              <div className="p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-full mt-0.5">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-1">Managed Password</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400/80 font-medium leading-relaxed">
                    Password changes are currently managed by the IT administrator. If you need to reset your password, please contact support.
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                disabled 
                className="rounded-xl font-semibold border-gray-200 dark:border-gray-700"
              >
                Request Password Reset
              </Button>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
