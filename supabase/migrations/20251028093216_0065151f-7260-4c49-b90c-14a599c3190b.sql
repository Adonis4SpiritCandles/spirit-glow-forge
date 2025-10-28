-- Create table for cart reminder tracking
CREATE TABLE IF NOT EXISTS public.cart_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_reminder_sent TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reminder_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.cart_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reminders"
ON public.cart_reminders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage all reminders"
ON public.cart_reminders
FOR ALL
USING (true)
WITH CHECK (true);

-- Add index for performance
CREATE INDEX idx_cart_reminders_user_id ON public.cart_reminders(user_id);
CREATE INDEX idx_cart_reminders_last_sent ON public.cart_reminders(last_reminder_sent);

-- Create function to update timestamps
CREATE TRIGGER update_cart_reminders_updated_at
BEFORE UPDATE ON public.cart_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();