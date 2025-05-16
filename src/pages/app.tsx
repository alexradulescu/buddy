import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'

const AccountsPage = lazy(() => import('./accounts-page'))
const ExpensesPage = lazy(() => import('./expenses-page'))
const HomePage = lazy(() => import('./home-page'))
const IncomesPage = lazy(() => import('./incomes-page'))
const RootLayout = lazy(() => import('./layout'))
const SettingsPage = lazy(() => import('./settings-page'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RootLayout>
              <HomePage />
            </RootLayout>
          }
        />
        <Route
          path="/expenses"
          element={
            <RootLayout>
              <ExpensesPage />
            </RootLayout>
          }
        />
        <Route
          path="/incomes"
          element={
            <RootLayout>
              <IncomesPage />
            </RootLayout>
          }
        />
        <Route
          path="/accounts"
          element={
            <RootLayout>
              <AccountsPage />
            </RootLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <RootLayout>
              <SettingsPage />
            </RootLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
