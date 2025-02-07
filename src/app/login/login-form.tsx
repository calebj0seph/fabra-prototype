'use client';

import { redirect } from 'next/navigation';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

import { loginAction, type LoginActionState } from '@/lib/auth/actions';

/**
 * Props for the login form contents.
 */
interface LoginFormContentsProps {
  /**
   * The current state of the login action. Used to display error messages if the login fails.
   */
  loginState: LoginActionState;
}

/**
 * Displays the contents of the login form.
 */
function LoginFormContents({ loginState }: LoginFormContentsProps) {
  const { pending: loginPending } = useFormStatus();

  return (
    <>
      <Typography variant="h4" component="h1">
        Login
      </Typography>
      {loginState.success === false && !loginPending && (
        <Alert severity="error">Invalid email address or password</Alert>
      )}
      <TextField label="Email" name="email" type="email" required />
      <TextField label="Password" name="password" type="password" required />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loginPending}
        loading={loginPending}
      >
        Login
      </Button>
    </>
  );
}

/**
 * Displays a form that allows users to log in.
 */
export function LoginForm() {
  const [loginState, loginFormAction] = useFormState(loginAction, {
    success: null,
  });

  useEffect(() => {
    if (loginState.success) {
      redirect('/files');
    }
  }, [loginState]);

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Box
        component="form"
        action={loginFormAction}
        noValidate
        autoComplete="off"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <LoginFormContents loginState={loginState} />
      </Box>
    </Container>
  );
}
