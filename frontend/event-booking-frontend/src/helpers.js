export function getStartOfWeek(weekOffset = 0) {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
}
  
export function formatFullDate(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const weekday = d.toLocaleDateString('pl-PL', { weekday: 'long' });
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}.${month} (${weekday}) ${time}`;
}
  
export function groupSlotsByDay(slots, weekOffset) {
    const startOfWeek = getStartOfWeek(weekOffset);
    const days = [];
  
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      days.push({
        date: dayDate,
        slots: slots.filter(slot => {
          const slotDate = new Date(slot.start_time);
          return slotDate.toDateString() === dayDate.toDateString();
        })
      });
    }
  
    return days;
}