import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'

const AccountsPage = lazy(() => import('./accounts-page'))
const ExpensesPage = lazy(() => import('./expenses-page'))
const HomePage = lazy(() => import('./home-page'))
const IncomesPage = lazy(() => import('./incomes-page'))
const InvestmentsPage = lazy(() => import('./investments-page'))
const InvestmentDetailPage = lazy(() => import('./investment-detail-page'))
const NewInvestmentPage = lazy(() => import('./new-investment-page'))
const EditInvestmentPage = lazy(() => import('./edit-investment-page'))
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
        <Route
          path="/investments"
          element={
            <RootLayout>
              <InvestmentsPage />
            </RootLayout>
          }
        />
        <Route
          path="/investments/new"
          element={
            <RootLayout>
              <NewInvestmentPage />
            </RootLayout>
          }
        />
        <Route
          path="/investments/:id"
          element={
            <RootLayout>
              <InvestmentDetailPage />
            </RootLayout>
          }
        />
        <Route
          path="/investments/:id/edit"
          element={
            <RootLayout>
              <EditInvestmentPage />
            </RootLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
