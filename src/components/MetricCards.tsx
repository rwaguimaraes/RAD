'use client';

import React from 'react';

interface Exercise {
  id: string;
  name: string;
  target_reps: number;
  reps_completed: number;
}

interface MetricCardsProps {
  exercises: Exercise[];
}

export default function MetricCards({ exercises }: MetricCardsProps) {
  const totalRepsDone = exercises.reduce((acc, curr) => acc + curr.reps_completed, 0);
  const totalTargetReps = exercises.reduce((acc, curr) => acc + curr.target_reps, 0);
  
  const percentage = totalTargetReps > 0 ? Math.round((totalRepsDone / totalTargetReps) * 100) : 0;
  const activeExercises = exercises.filter(e => e.reps_completed < e.target_reps).length;
  
  // SVG Circular progress configurations
  const sqSize = 120;
  const strokeWidth = 10;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  // Cap at 100% for the visual arc filling
  const dashOffset = totalTargetReps > 0
    ? dashArray - (dashArray * Math.min(percentage, 100)) / 100
    : dashArray;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Progresso Geral Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col md:flex-row items-center md:space-x-6">
        <div className="relative flex items-center justify-center">
          <svg width={sqSize} height={sqSize} viewBox={viewBox} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              className="stroke-gray-100"
              cx={sqSize / 2}
              cy={sqSize / 2}
              r={radius}
              strokeWidth={`${strokeWidth}px`}
              fill="none"
            />
            {/* Foreground circle showing progress */}
            <circle
              className="stroke-emerald-600 transition-all duration-500 ease-out"
              cx={sqSize / 2}
              cy={sqSize / 2}
              r={radius}
              strokeWidth={`${strokeWidth}px`}
              fill="none"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Inner Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-gray-800 leading-none">{percentage}%</span>
            <span className="text-[9px] font-medium text-gray-400 mt-1 uppercase tracking-wider">Concluído</span>
          </div>
        </div>

        <div className="mt-4 md:mt-0 text-center md:text-left flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Progresso Geral</h3>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {totalRepsDone} / <span className="text-gray-400 font-medium">{totalTargetReps} reps</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Total PTR de {exercises.length} {exercises.length === 1 ? 'exercício' : 'exercícios'}
          </p>
        </div>
      </div>

      {/* Exercícios Ativos Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total de Exercícios Ativos</h3>
          <p className="text-4xl font-extrabold text-gray-800 mt-4">{activeExercises}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Exercícios com meta de repetições pendente
        </p>
      </div>

      {/* Repetições Realizadas Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total de Repetições Feitas</h3>
          <p className="text-4xl font-extrabold text-gray-800 mt-4">{totalRepsDone}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Soma acumulada de todas as sessões registradas
        </p>
      </div>
    </div>
  );
}
