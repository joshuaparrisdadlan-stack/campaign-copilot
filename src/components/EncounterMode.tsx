import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  isPlayer: boolean;
  conditions: string[];
  initiativeRoll: number;
  lastAction?: string;
}

export function EncounterMode() {
  const { showSuccess, showError } = useToast();
  
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [isEncounterActive, setIsEncounterActive] = useState(false);
  const [newCombatantName, setNewCombatantName] = useState('');
  const [newCombatantHp, setNewCombatantHp] = useState('10');
  const [newCombatantAc, setNewCombatantAc] = useState('12');

  const addCombatant = () => {
    if (!newCombatantName.trim()) {
      showError('Enter combatant name');
      return;
    }

    const newCombatant: Combatant = {
      id: Math.random().toString(36).substring(7),
      name: newCombatantName,
      hp: parseInt(newCombatantHp) || 10,
      maxHp: parseInt(newCombatantHp) || 10,
      ac: parseInt(newCombatantAc) || 12,
      isPlayer: false,
      conditions: [],
      initiativeRoll: 0,
    };

    setCombatants([...combatants, newCombatant]);
    setNewCombatantName('');
    setNewCombatantHp('10');
    setNewCombatantAc('12');
    showSuccess(`${newCombatantName} added to encounter`);
  };

  const rollInitiative = () => {
    const sorted = [...combatants].map((c) => ({
      ...c,
      initiativeRoll: Math.floor(Math.random() * 20) + 1 + Math.floor(c.ac / 2),
    }));
    sorted.sort((a, b) => b.initiativeRoll - a.initiativeRoll);
    setCombatants(sorted);
    setIsEncounterActive(true);
    setCurrentTurnIndex(0);
    setRoundNumber(1);
    showSuccess('Initiative rolled!');
  };

  const damageRoll = (combatantId: string, amount: number) => {
    setCombatants(
      combatants.map((c) => 
        c.id === combatantId
          ? { ...c, hp: Math.max(0, c.hp - amount), lastAction: `Took ${amount} damage` }
          : c
      )
    );
  };

  const healRoll = (combatantId: string, amount: number) => {
    setCombatants(
      combatants.map((c) => 
        c.id === combatantId
          ? { ...c, hp: Math.min(c.maxHp, c.hp + amount), lastAction: `Healed ${amount} HP` }
          : c
      )
    );
  };

  const removeCondition = (combatantId: string, condition: string) => {
    setCombatants(
      combatants.map((c) => 
        c.id === combatantId
          ? { ...c, conditions: c.conditions.filter((cond) => cond !== condition) }
          : c
      )
    );
  };

  const nextTurn = () => {
    const nextIndex = (currentTurnIndex + 1) % combatants.length;
    if (nextIndex === 0) {
      setRoundNumber(roundNumber + 1);
    }
    setCurrentTurnIndex(nextIndex);
    showSuccess(`${combatants[nextIndex]?.name}'s turn!`);
  };

  const endEncounter = () => {
    setIsEncounterActive(false);
    setCombatants([]);
    setCurrentTurnIndex(0);
    setRoundNumber(1);
    showSuccess('Encounter ended');
  };

  const currentCombatant = combatants[currentTurnIndex];

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Encounter Mode</h2>
        {isEncounterActive && (
          <div className="text-sm">
            <p className="font-semibold text-red-400">Round {roundNumber}</p>
            {currentCombatant && (
              <p className="text-xs text-gray-400">{currentCombatant.name}'s turn</p>
            )}
          </div>
        )}
      </div>

      {!isEncounterActive ? (
        /* Setup Phase */
        <div className="space-y-4">
          {/* Add Combatants */}
          <div className="bg-gray-750 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-200">Add Combatants</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={newCombatantName}
                onChange={(e) => setNewCombatantName(e.target.value)}
                placeholder="Combatant name"
                className="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={newCombatantHp}
                  onChange={(e) => setNewCombatantHp(e.target.value)}
                  placeholder="HP"
                  className="px-3 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="number"
                  value={newCombatantAc}
                  onChange={(e) => setNewCombatantAc(e.target.value)}
                  placeholder="AC"
                  className="px-3 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button
                onClick={addCombatant}
                className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Add Combatant
              </button>
            </div>
          </div>

          {/* Combatants List */}
          {combatants.length > 0 && (
            <div className="bg-gray-750 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-200 mb-3">Combatants ({combatants.length})</h3>
              {combatants.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm bg-gray-700 p-2 rounded">
                  <span className="text-gray-100">{c.name}</span>
                  <div className="flex gap-2 text-xs text-gray-400">
                    <span>HP: {c.hp}/{c.maxHp}</span>
                    <span>AC: {c.ac}</span>
                    <button
                      onClick={() =>
                        setCombatants(combatants.filter((x) => x.id !== c.id))
                      }
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Start Encounter */}
          {combatants.length > 0 && (
            <button
              onClick={rollInitiative}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Start Encounter - Roll Initiative
            </button>
          )}
        </div>
      ) : (
        /* Combat Phase */
        <div className="space-y-4">
          {/* Current Turn Highlight */}
          {currentCombatant && (
            <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg p-4 border border-red-600/50">
              <h3 className="text-xl font-bold text-red-300 mb-4">{currentCombatant.name}'s Turn</h3>

              {/* HP and Status */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">HP</span>
                    <span className={currentCombatant.hp <= 0 ? 'text-red-400' : 'text-green-400'}>
                      {currentCombatant.hp}/{currentCombatant.maxHp}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-lg h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        currentCombatant.hp <= 0
                          ? 'bg-red-600'
                          : currentCombatant.hp <= currentCombatant.maxHp / 3
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${(currentCombatant.hp / currentCombatant.maxHp) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* AC Display */}
                <div className="text-sm">
                  <span className="text-gray-400">AC:</span>
                  <span className="ml-2 text-gray-100 font-semibold">{currentCombatant.ac}</span>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => damageRoll(currentCombatant.id, 5)}
                    className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
                  >
                    Damage (5)
                  </button>
                  <button
                    onClick={() => healRoll(currentCombatant.id, 5)}
                    className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors"
                  >
                    Heal (5)
                  </button>
                </div>

                {/* Conditions */}
                {currentCombatant.conditions.length > 0 && (
                  <div className="text-xs space-y-1 pt-2 border-t border-gray-600">
                    <p className="text-gray-400 font-semibold">Conditions:</p>
                    <div className="flex flex-wrap gap-1">
                      {currentCombatant.conditions.map((cond) => (
                        <button
                          key={cond}
                          onClick={() => removeCondition(currentCombatant.id, cond)}
                          className="px-2 py-1 bg-orange-900/40 text-orange-200 rounded border border-orange-600 hover:bg-orange-900/60"
                        >
                          {cond} ✕
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Action */}
                {currentCombatant.lastAction && (
                  <div className="text-xs text-gray-400 pt-2 italic">
                    Last: {currentCombatant.lastAction}
                  </div>
                )}
              </div>

              {/* Next Turn Button */}
              <button
                onClick={nextTurn}
                className="w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Next Turn (Round {roundNumber})
              </button>
            </div>
          )}

          {/* All Combatants Turn Order */}
          <div className="bg-gray-750 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-200 mb-3">Turn Order</h3>
            {combatants.map((c, idx) => (
              <div
                key={c.id}
                className={`flex items-center justify-between p-2 rounded text-sm transition-all ${
                  idx === currentTurnIndex
                    ? 'bg-red-900/40 border-l-4 border-red-500'
                    : 'bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-gray-400 font-mono w-4">{idx + 1}.</span>
                  <span className={c.hp <= 0 ? 'line-through text-gray-500' : 'text-gray-100'}>
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className={c.hp <= 0 ? 'text-red-400' : 'text-green-400'}>
                    {c.hp}/{c.maxHp}
                  </span>
                  <button
                    onClick={() => damageRoll(c.id, 1)}
                    className="text-red-400 hover:text-red-300"
                    title="Quick damage"
                  >
                    -
                  </button>
                  <button
                    onClick={() => healRoll(c.id, 1)}
                    className="text-green-400 hover:text-green-300"
                    title="Quick heal"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* End Encounter Button */}
          <button
            onClick={endEncounter}
            className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-colors"
          >
            End Encounter
          </button>
        </div>
      )}
    </div>
  );
}
