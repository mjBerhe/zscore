import { createFileRoute } from '@tanstack/react-router'
import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'

export const Route = createFileRoute('/home')({
  component: Home,
})

function Home() {
  const { user } = useUser()

  console.log(user?.id)

  return (
    <div>
      <SignedOut>
        <p>Please sign in to continue:</p>
        <SignInButton>Sign In</SignInButton>
      </SignedOut>

      <SignedIn>
        <p>Welcome, {user?.firstName || 'User'}!</p>
        <p>Your Clerk ID: {user?.id}</p>
      </SignedIn>
    </div>
  )
}
