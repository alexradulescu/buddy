import { useState } from 'react'
import { useInvestmentStore } from '@/stores/useInvestmentStore'
import { Plus } from 'lucide-react'
import InvestmentCard from '@/components/investment/investment-card'
import InvestmentForm from '@/components/investment/forms/investment-form'
import { useSetHeaderAction } from '@/contexts/header-action-context'
import { Button, Modal, Stack, Title, Text, Card, SimpleGrid, Center, ActionIcon } from '@mantine/core'

export default function InvestmentsPage() {
  const { investments } = useInvestmentStore()
  const [addModalOpen, setAddModalOpen] = useState(false)

  useSetHeaderAction(
    <>
      <Button
        onClick={() => setAddModalOpen(true)}
        leftSection={<Plus size={16} />}
        visibleFrom="sm"
      >
        Add Investment
      </Button>
      <ActionIcon
        onClick={() => setAddModalOpen(true)}
        variant="filled"
        hiddenFrom="sm"
        size="lg"
        aria-label="Add Investment"
      >
        <Plus size={18} />
      </ActionIcon>
    </>
  )

  return (
    <Stack gap="md">
      {investments.length === 0 ? (
        <Card p="lg">
          <Center>
            <Stack align="center" gap="sm">
              <Title order={4}>No investments yet</Title>
              <Text size="sm" c="dimmed">Get started by adding your first investment</Text>
              <Button onClick={() => setAddModalOpen(true)} leftSection={<Plus size={16} />}>
                Add Investment
              </Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
          {investments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Investment"
        centered
      >
        <InvestmentForm
          onSuccess={() => setAddModalOpen(false)}
          onCancel={() => setAddModalOpen(false)}
        />
      </Modal>
    </Stack>
  )
}
