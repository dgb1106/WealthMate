import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect from the root to the login page
  redirect('/pages/auth/login');
}