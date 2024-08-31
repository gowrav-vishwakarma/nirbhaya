import { api } from 'boot/axios';
import { useForm } from 'src/qnatk/composibles/use-form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useUserForm<ResponseFormat extends object>(
  initialUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues: Record<string, any>
) {
  return useForm<ResponseFormat>(api, '' + initialUrl, defaultValues);
}
