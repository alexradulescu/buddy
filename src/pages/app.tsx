import { BrowserRouter, Route, Routes } from 'react-router'
import AccountsPage from './accounts-page'
import ExpensesPage from './expenses-page'
import HomePage from './home-page'
import IncomesPage from './incomes-page'
import RootLayout from './layout'
import SettingsPage from './settings-page'

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
