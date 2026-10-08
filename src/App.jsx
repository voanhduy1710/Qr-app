import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import HeartQrPage from './features/heart-qr/HeartQrPage'

// Gift pages are what recipients open from the QR, so they load on their own
// and do not pull in the admin/QR code.
const BirthdayPage = lazy(() => import('./features/birthday/BirthdayPage'))
const AnniversaryPage = lazy(() => import('./features/anniversary/AnniversaryPage'))
const HomePage = lazy(() => import('./features/admin/HomePage'))

const withSuspense = (element) => <Suspense fallback={<div className="page-black" />}>{element}</Suspense>

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/home" replace /> },
  { path: '/home', element: withSuspense(<HomePage />) },
  { path: '/qr/:occasion', element: <HeartQrPage /> },
  { path: '/birthday', element: withSuspense(<BirthdayPage />) },
  { path: '/anniversary', element: withSuspense(<AnniversaryPage />) },
  { path: '*', element: <Navigate to="/home" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
