import { useState } from 'react'
import { Button, Center, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useAuthActions } from '@convex-dev/auth/react'

// Email + password. The first time, "Create account" sets the password (only the owner email is allowed).
export function SignIn() {
  const { signIn } = useAuthActions()
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(form: FormData) {
    setLoading(true)
    setError('')
    try {
      await signIn('password', form)
    } catch {
      setError(flow === 'signIn' ? 'Wrong email or password' : 'Could not create the account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Center mih="100vh" bg="var(--color-page-background)" p="md">
      <Paper w={360} p="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(new FormData(e.currentTarget))
          }}
        >
          <Stack gap="sm">
            <Title order={1} size="h3">
              Buddy
            </Title>
            <TextInput name="email" type="email" label="Email" autoComplete="email" required />
            <PasswordInput
              name="password"
              label="Password"
              autoComplete={flow === 'signIn' ? 'current-password' : 'new-password'}
              minLength={8}
              required
            />
            <input name="flow" type="hidden" value={flow} />
            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}
            <Button type="submit" loading={loading}>
              {flow === 'signIn' ? 'Sign in' : 'Create account'}
            </Button>
            <Button variant="subtle" size="xs" onClick={() => setFlow(flow === 'signIn' ? 'signUp' : 'signIn')}>
              {flow === 'signIn' ? 'First time? Create account' : 'Have an account? Sign in'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  )
}
