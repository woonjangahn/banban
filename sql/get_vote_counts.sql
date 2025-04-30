-- Function to get vote counts by option for a specific poll
CREATE OR REPLACE FUNCTION get_vote_counts_by_option(poll_id_param UUID)
RETURNS TABLE (
  option_id UUID,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT v.option_id, COUNT(v.id)::BIGINT
  FROM votes v
  WHERE v.poll_id = poll_id_param
  GROUP BY v.option_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;