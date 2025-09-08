export const PROGRESS_BOOST_RULES = {
  low: { new: 4, mid: 6, old: 0 },
  medium: { new: 1, mid: 1, old: 1 },
  high: { new: 1, mid: 1, old: 1 }
}

export const NEW_DAYS = 7
export const MID_DAYS = 28

export function thisWeekBoundsLondon(): { start: Date; end: Date } {
  const now = new Date()
  const londonTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }))
  
  // Get Monday of current week (0 = Sunday, 1 = Monday)
  const dayOfWeek = londonTime.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  
  const start = new Date(londonTime)
  start.setDate(londonTime.getDate() - daysToMonday)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}
