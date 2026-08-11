type TrendArrowIconProps = {
  direction: 'up' | 'down';
};

const icons = {
  up: {
    color: '#5FC41F',
    path: 'M7.64646 5.64645C7.84172 5.45118 8.15831 5.45118 8.35357 5.64645L12.3536 9.64645C12.4966 9.78945 12.5393 10.0045 12.462 10.1913C12.3846 10.3782 12.2022 10.5 12 10.5H4.00001C3.79778 10.5 3.61547 10.3782 3.53807 10.1913C3.46068 10.0045 3.50346 9.78945 3.64646 9.64645L7.64646 5.64645Z',
  },
  down: {
    color: '#FF7D78',
    path: 'M4.00001 5.50003L12 5.5C12.2022 5.5 12.3846 5.62182 12.462 5.80866C12.5393 5.99549 12.4966 6.21055 12.3536 6.35355L8.3536 10.3536C8.15834 10.5488 7.84176 10.5488 7.6465 10.3536L3.64646 6.35359C3.50346 6.21059 3.46068 5.99553 3.53807 5.80869C3.61546 5.62185 3.79778 5.50003 4.00001 5.50003Z',
  },
} as const;

export function TrendArrowIcon({ direction }: TrendArrowIconProps) {
  const icon = icons[direction];

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-4 shrink-0"
      data-trend-arrow={direction}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={icon.path}
        fill={icon.color}
      />
    </svg>
  );
}
