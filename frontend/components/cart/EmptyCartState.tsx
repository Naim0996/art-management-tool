import Link from 'next/link';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

interface EmptyCartStateProps {
  locale: string;
}

export default function EmptyCartState({ locale }: EmptyCartStateProps) {
  return (
    <Card className="text-center py-16 bg-white border-2 border-gray-200">
      <div className="space-y-4">
        <i className="pi pi-shopping-cart text-6xl text-gray-400"></i>
        <h2 className="text-2xl font-semibold text-gray-800">Il tuo carrello è vuoto</h2>
        <p className="text-gray-600">Inizia a fare shopping per aggiungere prodotti</p>
        <Link href={`/${locale}/shop`}>
          <Button
            label="Vai allo Shop"
            icon="pi pi-shopping-bag"
            size="large"
            className="mt-4"
            style={{
              backgroundColor: '#0066CC',
              borderColor: '#0066CC',
              fontWeight: '600'
            }}
          />
        </Link>
      </div>
    </Card>
  );
}
