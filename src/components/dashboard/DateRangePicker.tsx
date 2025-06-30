import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker, type DateRange } from 'react-day-picker';

// 1. Remova o import de 'react-day-picker/dist/style.css'
// 2. Importe nosso novo arquivo de estilos no lugar


interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
}

// 3. O objeto 'calendarStyles' foi REMOVIDO daqui.

export function DateRangePicker({ date, setDate, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);
  
  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    if (selectedDate?.from && selectedDate?.to) {
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        id="date"
        onClick={() => setIsOpen(!isOpen)}
        className="w-[300px] justify-start text-left font-normal bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white flex items-center p-2 rounded-md"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date?.from ? (
          date.to ? (
            <>
              {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
            </>
          ) : (
            format(date.from, 'dd/MM/yyyy')
          )
        ) : (
          <span>Escolha um período</span>
        )}
      </button>

      {isOpen && (
        // O calendário agora será estilizado pelo nosso arquivo CSS importado
        <div className="absolute top-[45px] right-0 z-10">
            <DayPicker
              mode="range"
              selected={date}
              onSelect={handleSelect}
              locale={ptBR}
              numberOfMonths={2}
            />
        </div>
      )}
    </div>
    
  );
  
}
