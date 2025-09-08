export interface DataPlan {
  id: string;
  plan_name: string;
  data_amount: string;
  price: string;
  validity: string;
}

export interface DataPlanSelectionProps {
  network: string;
  onPlanSelect: (plan: DataPlan) => void;
  onBack: () => void;
}