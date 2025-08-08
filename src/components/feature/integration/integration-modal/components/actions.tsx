import { config } from "@/main";
import { useQuery } from "@tanstack/react-query";

type ActionsSectionProps = {
    integration: string;
}

export default function ActionsSection({ integration }: ActionsSectionProps) {
  const actions = useQuery({
    queryKey: ['actions', integration],
    queryFn: async () => {
      const response = await fetch(`https://actionkit.useparagon.com/projects/${config.VITE_PARAGON_PROJECT_ID}/actions?integrations=${integration}&format=paragon`, {
        headers: {
          'Authorization': `Bearer ${config.VITE_PARAGON_JWT_TOKEN}`
        }
      });
      const data = await response.json();
      return data.actions[integration] ?? [];
    }
  });
  return actions.data?.map((action: any) => (
    <div key={action.name}>
      <h3>{action.title}</h3>
      <p>{action.description}</p>
    </div>
  ));
}