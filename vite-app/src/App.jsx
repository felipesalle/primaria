import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import { 
    onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence
} from 'firebase/auth';
import { 
    collection, onSnapshot, query, where, doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs
} from 'firebase/firestore';
import { auth, db, APP_ID } from './config/firebase';
import { 
    APP_LEVEL_NAME, sendTelegramNotification, sortLeagues, getSportTerms, 
    getSportScoringInfo, HOLIDAY_CTE_DATES, parseLocalDate, formatLocalDate, 
    getFridayForDate, PRESET_THEMES, SPORTS_HERO_PRESETS 
} from './config/constants';
import { 
    generateUpcomingMatchesPdf, generateRefereeSheetPdf, 
    generateStandingsAndTopScorersPdf, generateTeamRostersPdf 
} from './utils/pdfGenerator';
import { 
    getFacebookSummaryData, copyFacebookSummaryText, printFacebookSummaryWindow 
} from './utils/facebookPoster';
import { Modal } from './components/Modal';
import { EditTeamModal } from './components/EditTeamModal';
import { AddPlayersModal } from './components/AddPlayersModal';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import { TeamDetailView } from './components/TeamDetailView';
import { StandingsTable } from './components/StandingsTable';
import { TopScorersTable } from './components/TopScorersTable';
import { ResultsList } from './components/ResultsList';
import { InteractiveCalendar } from './components/InteractiveCalendar';
import { MatchesView } from './components/MatchesView';
import { LeagueCard } from './components/LeagueCard';
import { PlayoffsBracketView } from './components/PlayoffsBracketView';
import { 
    TrophyIcon, ShieldIcon, CalendarIcon, ChartIcon, UserGroupIcon, 
    LockClosedIcon, TrashIcon, PencilIcon, PlusIcon, FileTextIcon, 
    CheckIcon, SunIcon, MoonIcon, WhatsAppIcon, SearchIcon 
} from './components/Icons';

const DataContext = createContext();

export const DataProvider = ({ children, user, isAuthReady }) => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournamentId, setSelectedTournamentId] = useState('');
    const [leagues, setLeagues] = useState([]);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const q = collection(db, `artifacts/${APP_ID}/public/data/tournaments`);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                if (timeA !== timeB) return timeB - timeA;
                return (b.id || '').localeCompare(a.id || '');
            });
            setTournaments(data);
            if (data.length > 0) {
                setSelectedTournamentId(prev => {
                    if (!prev || !data.some(t => t.id === prev)) {
                        return data[0].id;
                    }
                    return prev;
                });
            }
        }, err => console.error("Tournaments listener error:", err));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const collections = ['leagues', 'teams', 'players', 'matches'];
        const unsubscribes = collections.map(colName => {
            const q = collection(db, `artifacts/${APP_ID}/public/data/${colName}`);
            return onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (colName === 'leagues') setLeagues(data);
                if (colName === 'teams') setTeams(data);
                if (colName === 'players') setPlayers(data);
                if (colName === 'matches') setMatches(data);
            }, err => console.error(`${colName} listener error:`, err));
        });

        setIsLoading(false);
        return () => unsubscribes.forEach(unsub => unsub());
    }, []);

    const activeTournament = useMemo(() => tournaments.find(t => t.id === selectedTournamentId), [tournaments, selectedTournamentId]);

    const getMatchBadge = useCallback((dateString, stage) => {
        if (stage && stage !== 'regular') {
            const stageBadges = {
                'semifinal': '🔥 Semifinal',
                'final': '👑 Gran Final',
                '3rd_place': '🥉 3er Lugar'
            };
            return <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-300 shadow-sm">{stageBadges[stage] || '🏆 Liguilla'}</span>;
        }

        if (!activeTournament?.inaugurationDate) {
            return <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 shadow-sm">🤝 Amistoso</span>;
        }

        if (dateString < activeTournament.inaugurationDate) {
            return <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 shadow-sm">🤝 Amistoso</span>;
        }
        if (dateString === activeTournament.inaugurationDate) {
            return <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-300 shadow-sm">🎉 Inauguración</span>;
        }
        return <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 shadow-sm">🏆 Oficial</span>;
    }, [activeTournament]);

    const value = {
        tournaments, selectedTournamentId, setSelectedTournamentId,
        leagues, teams, players, matches,
        isLoading, setIsLoading,
        appId: APP_ID, user, getMatchBadge, activeTournament
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);

export function App() {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const showMessage = (message) => { setModalMessage(message); setShowModal(true); };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            if (setPersistence && browserSessionPersistence) {
                await setPersistence(auth, browserSessionPersistence);
            }
            await signInWithEmailAndPassword(auth, email, password);
            showMessage("Inicio de sesión exitoso.");
            sendTelegramNotification("Ha iniciado sesión en el modo administrador.", email);
        } catch (error) {
            showMessage("Error al iniciar sesión: " + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            showMessage("Sesión cerrada.");
        } catch (error) {
            showMessage("Error al cerrar sesión: " + error.message);
        }
    };

    return (
        <DataProvider user={user} isAuthReady={isAuthReady}>
            <AppContent
                user={user}
                isAuthReady={isAuthReady}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showMessage={showMessage}
            />
            <Modal show={showModal} message={modalMessage} onClose={() => setShowModal(false)} />
        </DataProvider>
    );
}

const AppContent = ({ user, handleLogin, handleLogout, email, setEmail, password, setPassword, showMessage, isAuthReady }) => {
    const {
        tournaments, selectedTournamentId, setSelectedTournamentId,
        leagues, teams, players, matches,
        isLoading, setIsLoading, appId, getMatchBadge, activeTournament
    } = useData();

    const [view, setView] = useState('standings');
    const [adminTab, setAdminTab] = useState('tournaments');
    const [selectedDateFilter, setSelectedDateFilter] = useState('');
    const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('');
    const [selectedStandingsLeagueFilter, setSelectedStandingsLeagueFilter] = useState('');
    const [upcomingMatchesDate, setUpcomingMatchesDate] = useState('');
    const [refereeMatchDate, setRefereeMatchDate] = useState('');
    const [scheduleStartDate, setScheduleStartDate] = useState('');
    const [matchDetails, setMatchDetails] = useState(null);
    const [editingTeam, setEditingTeam] = useState(null);
    const [addingPlayersTeam, setAddingPlayersTeam] = useState(null);
    const [selectedTeamIdForDetail, setSelectedTeamIdForDetail] = useState(null);
    const [rosterSport, setRosterSport] = useState('');
    const [playoffsSemifinalDate, setPlayoffsSemifinalDate] = useState('');
    const [playoffsFinalsDate, setPlayoffsFinalsDate] = useState('');
    const [playoffTiebreakerRule, setPlayoffTiebreakerRule] = useState('penalties');

    const handleViewTeamDetails = (teamId) => {
        setSelectedTeamIdForDetail(teamId);
        setView('teamDetail');
    };

    const handleMatchClick = (match) => { setMatchDetails(match); };

    const getTeamName = useCallback((teamId) => teams.find(t => t.id === teamId)?.name || 'Equipo Desconocido', [teams]);
    const getTeamLogo = useCallback((teamId) => teams.find(t => t.id === teamId)?.logoUrl || '', [teams]);
    const getPlayerName = useCallback((playerId) => players.find(p => p.id === playerId)?.name || 'Jugador Desconocido', [players]);
    const getLeagueName = useCallback((leagueId) => leagues.find(l => l.id === leagueId)?.name || 'Liga Desconocida', [leagues]);
    const getPlayersByTeam = useCallback((teamId) => players.filter(p => p.teamId === teamId), [players]);

    const visibleLeagues = useMemo(() => leagues.filter(l => l.tournamentId === selectedTournamentId), [leagues, selectedTournamentId]);
    const visibleLeagueIds = useMemo(() => visibleLeagues.map(l => l.id), [visibleLeagues]);
    const visibleTeams = useMemo(() => teams.filter(t => visibleLeagueIds.includes(t.leagueId)), [teams, visibleLeagueIds]);
    const visibleTeamIds = useMemo(() => visibleTeams.map(t => t.id), [visibleTeams]);
    const visiblePlayers = useMemo(() => players.filter(p => visibleTeamIds.includes(p.teamId)), [players, visibleTeamIds]);
    const visibleMatches = useMemo(() => matches.filter(m => visibleLeagueIds.includes(m.leagueId)), [matches, visibleLeagueIds]);

    const calculateStandings = useCallback((leagueId, visibleTeams, visibleMatches) => {
        const leagueTeams = visibleTeams.filter(t => t.leagueId === leagueId);
        const standings = leagueTeams.map(team => ({
            id: team.id,
            teamName: team.name,
            logoUrl: team.logoUrl,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
        }));

        const officialMatches = visibleMatches.filter(m => {
            if (m.leagueId !== leagueId) return false;
            if (m.stage && m.stage !== 'regular') return false;
            if (activeTournament?.inaugurationDate && m.date < activeTournament.inaugurationDate) return false;
            return true;
        });

        officialMatches.forEach(match => {
            if (match.scoreHome === null || match.scoreHome === undefined || match.scoreAway === null || match.scoreAway === undefined) return;

            const homeTeam = standings.find(t => t.id === match.homeTeamId);
            const awayTeam = standings.find(t => t.id === match.awayTeamId);

            if (homeTeam && awayTeam) {
                homeTeam.played += 1;
                awayTeam.played += 1;

                homeTeam.goalsFor += match.scoreHome;
                homeTeam.goalsAgainst += match.scoreAway;
                awayTeam.goalsFor += match.scoreAway;
                awayTeam.goalsAgainst += match.scoreHome;

                if (match.scoreHome > match.scoreAway) {
                    homeTeam.wins += 1;
                    homeTeam.points += 3;
                    awayTeam.losses += 1;
                } else if (match.scoreAway > match.scoreHome) {
                    awayTeam.wins += 1;
                    awayTeam.points += 3;
                    homeTeam.losses += 1;
                } else {
                    homeTeam.draws += 1;
                    awayTeam.draws += 1;
                    homeTeam.points += 1;
                    awayTeam.points += 1;
                }
            }
        });

        standings.forEach(team => {
            team.goalDifference = team.goalsFor - team.goalsAgainst;
        });

        return standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });
    }, [activeTournament]);

    const calculateTopScorers = useCallback((leagueId, visibleMatches, visiblePlayers, visibleTeams) => {
        const officialMatches = visibleMatches.filter(m => {
            if (m.leagueId !== leagueId) return false;
            if (activeTournament?.inaugurationDate && m.date < activeTournament.inaugurationDate) return false;
            return true;
        });

        const scorersMap = officialMatches.flatMap(m => m.scorers || [])
            .reduce((acc, scorer) => {
                const player = visiblePlayers.find(p => p.id === scorer.playerId);
                if (player) {
                    const team = visibleTeams.find(t => t.id === player.teamId);
                    if (team) {
                        acc[scorer.playerId] = acc[scorer.playerId] || { playerName: player.name, teamName: team.name, logoUrl: team.logoUrl, goals: 0 };
                        acc[scorer.playerId].goals += Number(scorer.count) || 0;
                    }
                }
                return acc;
            }, {});

        return Object.values(scorersMap).sort((a, b) => b.goals - a.goals);
    }, [activeTournament]);

    const handleMatchDayChange = async (leagueId, day) => {
        if (!user || !appId) return;
        try {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/leagues`, leagueId), { matchDay: day ? parseInt(day, 10) : null });
            const dayLabel = day ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][parseInt(day, 10)] : 'ninguno';
            sendTelegramNotification(`Día de partido actualizado para liga ${getLeagueName(leagueId)} a ${dayLabel}`, user.email);
        } catch (e) { console.error("Error updating match day:", e); showMessage("Error al actualizar el día."); }
    };

    const handleThemeChange = async (leagueId, theme) => {
        if (!user || !appId) return;
        try {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/leagues`, leagueId), { theme });
            const presetList = PRESET_THEMES[theme];
            if (presetList) {
                const leagueTeams = teams.filter(t => t.leagueId === leagueId);
                for (let i = 0; i < leagueTeams.length; i++) {
                    const preset = presetList[i % presetList.length];
                    await updateDoc(doc(db, `artifacts/${appId}/public/data/teams`, leagueTeams[i].id), {
                        name: preset.name,
                        logoUrl: preset.logoUrl
                    });
                }
            }
            showMessage(`Temática y equipos actualizados a "${theme}".`);
        } catch (e) { console.error("Error updating theme:", e); showMessage("Error al actualizar la temática."); }
    };

    const handleApplyThemeTeams = async (leagueId, themeName) => {
        const targetTheme = themeName || 'Liga MX';
        const presetList = PRESET_THEMES[targetTheme];
        if (!presetList) {
            showMessage("Por favor, selecciona primero una Temática de Equipos en el selector.");
            return;
        }

        const leagueTeams = teams.filter(t => t.leagueId === leagueId);
        if (leagueTeams.length === 0) return;

        if (!confirm(`¿Deseas aplicar los nombres y escudos oficiales de '${targetTheme}' a los ${leagueTeams.length} equipos de esta liga?`)) return;

        setIsLoading(true);
        try {
            for (let i = 0; i < leagueTeams.length; i++) {
                const preset = presetList[i % presetList.length];
                await updateDoc(doc(db, `artifacts/${appId}/public/data/teams`, leagueTeams[i].id), {
                    name: preset.name,
                    logoUrl: preset.logoUrl
                });
            }
            showMessage(`Equipos actualizados exitosamente con la temática '${targetTheme}'.`);
        } catch (e) {
            console.error("Error applying theme teams:", e);
            showMessage("Error al aplicar los equipos de la temática.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTeam = async (teamId, name, logoUrl) => {
        if (!user || !appId) return;
        try {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/teams`, teamId), { name, logoUrl });
            showMessage("Equipo actualizado con éxito.");
            sendTelegramNotification(`Equipo actualizado: ${name} (ID: ${teamId})`, user.email);
            setEditingTeam(null);
        } catch (e) {
            console.error("Error updating team:", e); showMessage("Error al actualizar el equipo.");
        }
    };

    const handleAddMultiplePlayers = async (teamId, playerList) => {
        if (!user || !appId) return;
        const playerPromises = playerList.map(player => {
            const playerId = crypto.randomUUID();
            return setDoc(doc(db, `artifacts/${appId}/public/data/players`, playerId), { 
                id: playerId, 
                name: player.name, 
                group: player.group, 
                teamId 
            });
        });

        try {
            await Promise.all(playerPromises);
            showMessage(`${playerList.length} jugador(es) añadido(s) con éxito.`);
            sendTelegramNotification(`Jugadores añadidos al equipo ${getTeamName(teamId)}: ${playerList.map(p => p.name).join(', ')}`, user.email);
            setAddingPlayersTeam(null);
        } catch (e) {
            console.error("Error adding multiple players:", e);
            showMessage("Error al añadir los jugadores.");
        }
    };

    const handleAddTeam = async (leagueId) => {
        if (!user || !appId) return;
        const teamId = crypto.randomUUID();
        const newTeam = {
            id: teamId,
            name: `Nuevo Equipo ${teams.filter(t => t.leagueId === leagueId).length + 1}`,
            leagueId,
            logoUrl: `https://placehold.co/100x100/A0A0A0/FFF?text=N`
        };
        try {
            await setDoc(doc(db, `artifacts/${appId}/public/data/teams`, teamId), newTeam);
            showMessage("Equipo añadido con éxito.");
            sendTelegramNotification(`Equipo añadido a liga ${getLeagueName(leagueId)}: ${newTeam.name}`, user.email);
        } catch (e) {
            console.error("Error adding team:", e);
            showMessage("Error al añadir el equipo.");
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!user || !appId) return;
        if (!confirm("¿Estás seguro de que quieres eliminar este equipo? Se borrarán también sus jugadores y partidos asociados.")) return;
        try {
            const batch = writeBatch(db);
            const playersQuery = query(collection(db, `artifacts/${appId}/public/data/players`), where("teamId", "==", teamId));
            const playersSnapshot = await getDocs(playersQuery);
            playersSnapshot.forEach(playerDoc => batch.delete(playerDoc.ref));

            const homeMatchesQuery = query(collection(db, `artifacts/${appId}/public/data/matches`), where("homeTeamId", "==", teamId));
            const awayMatchesQuery = query(collection(db, `artifacts/${appId}/public/data/matches`), where("awayTeamId", "==", teamId));
            const [homeMatchesSnapshot, awayMatchesSnapshot] = await Promise.all([getDocs(homeMatchesQuery), getDocs(awayMatchesQuery)]);
            homeMatchesSnapshot.forEach(matchDoc => batch.delete(matchDoc.ref));
            awayMatchesSnapshot.forEach(matchDoc => batch.delete(matchDoc.ref));

            batch.delete(doc(db, `artifacts/${appId}/public/data/teams`, teamId));
            await batch.commit();
            showMessage("Equipo y datos asociados eliminados con éxito.");
        } catch (e) {
            console.error("Error deleting team:", e);
            showMessage("Error al eliminar el equipo y sus datos asociados.");
        }
    };

    const handleDeleteTournament = async () => {
        if (!selectedTournamentId) {
            showMessage("Por favor, selecciona un torneo para eliminar.");
            return;
        }

        if (confirm(`¿Estás seguro de que quieres eliminar el torneo '${tournaments.find(t => t.id === selectedTournamentId)?.name}' y TODOS sus datos (ligas, equipos, jugadores, partidos)? Esta acción es irreversible.`)) {
            setIsLoading(true);
            try {
                const leaguesQuery = query(collection(db, `artifacts/${appId}/public/data/leagues`), where("tournamentId", "==", selectedTournamentId));
                const leaguesSnapshot = await getDocs(leaguesQuery);
                const leagueIds = leaguesSnapshot.docs.map(d => d.id);

                if (leagueIds.length > 0) {
                    const teamsQuery = query(collection(db, `artifacts/${appId}/public/data/teams`), where("leagueId", "in", leagueIds));
                    const teamsSnapshot = await getDocs(teamsQuery);
                    const teamIds = teamsSnapshot.docs.map(d => d.id);

                    if (teamIds.length > 0) {
                        const playersQuery = query(collection(db, `artifacts/${appId}/public/data/players`), where("teamId", "in", teamIds));
                        const playersSnapshot = await getDocs(playersQuery);
                        await Promise.all(playersSnapshot.docs.map(d => deleteDoc(d.ref)));
                    }
                    await Promise.all(teamsSnapshot.docs.map(d => deleteDoc(d.ref)));

                    const matchesQuery = query(collection(db, `artifacts/${appId}/public/data/matches`), where("leagueId", "in", leagueIds));
                    const matchesSnapshot = await getDocs(matchesQuery);
                    await Promise.all(matchesSnapshot.docs.map(d => deleteDoc(d.ref)));
                }
                
                await Promise.all(leaguesSnapshot.docs.map(d => deleteDoc(d.ref)));
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/tournaments`, selectedTournamentId));

                const remainingTournaments = tournaments.filter(t => t.id !== selectedTournamentId);
                if (remainingTournaments.length > 0) {
                    setSelectedTournamentId(remainingTournaments[0].id);
                } else {
                    setSelectedTournamentId('');
                }

                showMessage("Torneo eliminado con éxito.");
            } catch (e) {
                console.error("Error deleting tournament:", e);
                showMessage("Error al eliminar el torneo.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleUpdateInaugurationDate = async (newInaugurationDate) => {
        if (!user || !appId || !selectedTournamentId) return;
        try {
            const oldInaugurationDate = activeTournament?.inaugurationDate || null;
            await updateDoc(doc(db, `artifacts/${appId}/public/data/tournaments`, selectedTournamentId), { inaugurationDate: newInaugurationDate });

            if (visibleMatches.length > 0) {
                const batch = writeBatch(db);
                let updatedCount = 0;

                if (oldInaugurationDate) {
                    visibleMatches.forEach(m => {
                        if (m.date === oldInaugurationDate) {
                            const restoredDate = m.originalDate || getFridayForDate(oldInaugurationDate);
                            if (restoredDate !== m.date) {
                                batch.update(doc(db, `artifacts/${appId}/public/data/matches`, m.id), { date: restoredDate });
                                updatedCount++;
                            }
                        }
                    });
                }

                if (newInaugurationDate) {
                    const targetFriday = getFridayForDate(newInaugurationDate);
                    const targetObj = parseLocalDate(newInaugurationDate);

                    visibleMatches.forEach(m => {
                        const currentOriginal = m.originalDate || getFridayForDate(m.date);
                        const matchDateObj = parseLocalDate(m.date);
                        const diffMs = Math.abs(matchDateObj.getTime() - targetObj.getTime());
                        const diffDays = diffMs / (1000 * 60 * 60 * 24);

                        if (currentOriginal === targetFriday || diffDays <= 4) {
                            if (m.date !== newInaugurationDate) {
                                batch.update(doc(db, `artifacts/${appId}/public/data/matches`, m.id), { 
                                    date: newInaugurationDate,
                                    originalDate: currentOriginal
                                });
                                updatedCount++;
                            }
                        }
                    });
                }

                if (updatedCount > 0) {
                    await batch.commit();
                }
            }

            showMessage(newInaugurationDate ? `Fecha de inauguración deportiva establecida: ${newInaugurationDate}` : "Fecha de inauguración eliminada. Todos los partidos han sido restaurados a su viernes original.");
        } catch (e) {
            console.error("Error updating inauguration date:", e);
            showMessage("Error al guardar la fecha de inauguración.");
        }
    };

    const handleDeleteSchedule = async () => {
        if (confirm("¿Estás seguro de que quieres borrar TODO el calendario para el torneo actual? Esta acción no se puede deshacer.")) {
            if (!user || !appId || visibleLeagueIds.length === 0) return;
            setIsLoading(true);
            try {
                const q = query(collection(db, `artifacts/${appId}/public/data/matches`), where("leagueId", "in", visibleLeagueIds));
                const existingMatches = await getDocs(q);
                if (existingMatches.docs.length > 0) {
                    await Promise.all(existingMatches.docs.map(matchDoc => deleteDoc(matchDoc.ref)));
                    showMessage("Calendario del torneo actual borrado.");
                } else {
                    showMessage("No se encontraron partidos para borrar en el calendario actual.");
                }
            } catch (e) { console.error("Error deleting schedule:", e); showMessage("Error al borrar el calendario: " + e.message); } 
            setIsLoading(false);
        }
    };

    const createLeaguesAndTeams = async () => {
        if (!user || !appId) return;
        const tournamentName = prompt(`Introduce un nombre para el nuevo torneo:`, `Torneo Primaria ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
        if (!tournamentName) return;

        setIsLoading(true);
        const defaultThemes = {
            "Futbol 1ro y 2do de Primaria": "Liga MX",
            "Futbol 3ro y 4to de Primaria": "Premier League",
            "Futbol 5to y 6to de Primaria": "LaLiga Española",
            "Basquetbol 1ro y 2do de Primaria": "Estados de México",
            "Basquetbol 3ro y 4to de Primaria": "Equipos NBA",
            "Basquetbol 5to y 6to de Primaria": "Selecciones (Países)",
        };

        const leaguesData = [
            { name: "Futbol 1ro y 2do de Primaria", sport: "Fútbol", grades: "1ro y 2do", matchTime: "9:00-10:00" },
            { name: "Basquetbol 1ro y 2do de Primaria", sport: "Básquetbol", grades: "1ro y 2do", matchTime: "9:00-10:00" },
            { name: "Futbol 3ro y 4to de Primaria", sport: "Fútbol", grades: "3ro y 4to", matchTime: "8:00-9:00" },
            { name: "Basquetbol 3ro y 4to de Primaria", sport: "Básquetbol", grades: "3ro y 4to", matchTime: "8:00-9:00" },
            { name: "Futbol 5to y 6to de Primaria", sport: "Fútbol", grades: "5to y 6to", matchTime: "7:00-8:00" },
            { name: "Basquetbol 5to y 6to de Primaria", sport: "Básquetbol", grades: "5to y 6to", matchTime: "7:00-8:00" },
        ];

        const tournamentId = crypto.randomUUID();
        const newTournament = { id: tournamentId, name: tournamentName, createdAt: new Date().toISOString() };

        try {
            await setDoc(doc(db, `artifacts/${appId}/public/data/tournaments`, tournamentId), newTournament);

            for (const leagueData of leaguesData) {
                const leagueId = crypto.randomUUID();
                const theme = defaultThemes[leagueData.name] || "Liga MX";
                await setDoc(doc(db, `artifacts/${appId}/public/data/leagues`, leagueId), { 
                    id: leagueId, 
                    tournamentId,
                    theme,
                    matchDay: 5,
                    ...leagueData 
                });

                const presets = PRESET_THEMES[theme] || PRESET_THEMES["Liga MX"];
                const teamsToCreate = presets.slice(0, 4);

                for (const teamInfo of teamsToCreate) {
                    const teamId = crypto.randomUUID();
                    await setDoc(doc(db, `artifacts/${appId}/public/data/teams`, teamId), { 
                        id: teamId, 
                        name: teamInfo.name, 
                        leagueId,
                        logoUrl: teamInfo.logoUrl 
                    });
                }
            }
            setSelectedTournamentId(tournamentId);
            showMessage(`Torneo "${tournamentName}" creado con éxito.`);
        } catch (e) { console.error("Error creating tournament:", e); showMessage("Error al crear el torneo."); }
        setIsLoading(false);
    };

    const generateSchedule = async () => {
        if (!scheduleStartDate) {
            showMessage("Selecciona una fecha de inicio para el calendario base.");
            return;
        }

        setIsLoading(true);
        const matchesRef = collection(db, `artifacts/${appId}/public/data/matches`);
        const newMatches = [];

        try {
            const q = query(matchesRef, where("leagueId", "in", visibleLeagueIds));
            const existingMatches = await getDocs(q);
            await Promise.all(existingMatches.docs.map(matchDoc => deleteDoc(matchDoc.ref)));

            let currentSchedulingDate = parseLocalDate(scheduleStartDate);

            while (currentSchedulingDate.getDay() !== 5) {
                currentSchedulingDate.setDate(currentSchedulingDate.getDate() + 1);
            }

            const startYear = currentSchedulingDate.getFullYear();
            const startMonth = currentSchedulingDate.getMonth();
            const schoolYearEndYear = startMonth >= 6 ? startYear + 1 : startYear;
            const maxEndDate = new Date(schoolYearEndYear, 5, 30);

            const inaugurationDateStr = activeTournament?.inaugurationDate || null;
            let inaugurationDateObj = inaugurationDateStr ? parseLocalDate(inaugurationDateStr) : null;
            let inaugurationWeekHandled = false;

            const leagueOriginalTeams = new Map();
            visibleLeagues.forEach(league => {
                let teamsForLeague = visibleTeams.filter(team => team.leagueId === league.id);
                if (teamsForLeague.length % 2 !== 0) teamsForLeague.push({ id: 'bye', name: 'Descanso' });
                leagueOriginalTeams.set(league.id, [...teamsForLeague]);
            });

            let week = 0;
            while (currentSchedulingDate <= maxEndDate) {
                while (HOLIDAY_CTE_DATES.includes(formatLocalDate(currentSchedulingDate))) {
                    currentSchedulingDate.setDate(currentSchedulingDate.getDate() + 7);
                }

                if (currentSchedulingDate > maxEndDate) break;

                const fridayDateString = formatLocalDate(currentSchedulingDate);
                let matchDateString = fridayDateString;

                if (inaugurationDateObj && !inaugurationWeekHandled) {
                    const diffMs = Math.abs(currentSchedulingDate.getTime() - inaugurationDateObj.getTime());
                    const diffDays = diffMs / (1000 * 60 * 60 * 24);
                    if (diffDays <= 4) {
                        matchDateString = inaugurationDateStr;
                        inaugurationWeekHandled = true;
                    }
                }

                visibleLeagues.forEach(league => {
                    if (league.matchDay == null || league.matchDay !== 5) return;
                    let leagueTeams = leagueOriginalTeams.get(league.id);
                    if (!leagueTeams || leagueTeams.length < 2) return;

                    let currentRoundTeams = [...leagueTeams];
                    for (let r = 0; r < week; r++) {
                        currentRoundTeams.splice(1, 0, currentRoundTeams.pop());
                    }

                    for (let i = 0; i < currentRoundTeams.length / 2; i++) {
                        const home = currentRoundTeams[i];
                        const away = currentRoundTeams[currentRoundTeams.length - 1 - i];
                        if (home.id !== 'bye' && away.id !== 'bye') {
                            const newMatch = { 
                                id: crypto.randomUUID(), 
                                leagueId: league.id, 
                                homeTeamId: home.id, 
                                awayTeamId: away.id, 
                                date: matchDateString, 
                                originalDate: fridayDateString,
                                scoreHome: null, 
                                scoreAway: null, 
                                scorers: [] 
                            };
                            newMatches.push(newMatch);
                        }
                    }
                });

                week++;
                currentSchedulingDate.setDate(currentSchedulingDate.getDate() + 7);
            }

            if (newMatches.length > 0) {
                await Promise.all(newMatches.map(match => setDoc(doc(matchesRef, match.id), match)));
                showMessage(`Calendario escolar generado exitosamente hasta la última semana de junio, omitiendo vacaciones y CTE.`);
            } else {
                showMessage("No se generaron nuevos partidos. Verifica la fecha de inicio.");
            }

        } catch (e) { console.error("Error generating schedule:", e); showMessage("Error al generar el calendario."); } 
        setIsLoading(false);
    };

    const generatePlayoffsSchedule = async () => {
        if (!playoffsSemifinalDate || !playoffsFinalsDate) {
            showMessage("Por favor selecciona ambas fechas (Semifinales y Gran Final).");
            return;
        }
        setIsLoading(true);
        const matchesRef = collection(db, `artifacts/${appId}/public/data/matches`);

        try {
            const visibleLeagueIds = visibleLeagues.map(l => l.id);
            const q = query(matchesRef, where("leagueId", "in", visibleLeagueIds));
            const existingDocs = await getDocs(q);
            const playoffDocs = existingDocs.docs.filter(d => d.data().stage && d.data().stage !== 'regular');
            await Promise.all(playoffDocs.map(d => deleteDoc(d.ref)));

            await updateDoc(doc(db, `artifacts/${appId}/public/data/tournaments`, selectedTournamentId), {
                playoffTiebreakerRule: playoffTiebreakerRule || 'penalties',
                playoffsSemifinalDate,
                playoffsFinalsDate
            });

            const newPlayoffMatches = [];

            visibleLeagues.forEach(league => {
                const standings = calculateStandings(league.id, visibleTeams, visibleMatches);
                if (standings.length < 4) return;

                const t1 = standings[0];
                const t2 = standings[1];
                const t3 = standings[2];
                const t4 = standings[3];

                newPlayoffMatches.push({
                    id: crypto.randomUUID(),
                    leagueId: league.id,
                    homeTeamId: t1.id,
                    awayTeamId: t4.id,
                    date: playoffsSemifinalDate,
                    scoreHome: null,
                    scoreAway: null,
                    scorers: [],
                    stage: 'semifinal',
                    playoffKey: 'SF1',
                    seedHome: 1,
                    seedAway: 4
                });

                newPlayoffMatches.push({
                    id: crypto.randomUUID(),
                    leagueId: league.id,
                    homeTeamId: t2.id,
                    awayTeamId: t3.id,
                    date: playoffsSemifinalDate,
                    scoreHome: null,
                    scoreAway: null,
                    scorers: [],
                    stage: 'semifinal',
                    playoffKey: 'SF2',
                    seedHome: 2,
                    seedAway: 3
                });

                newPlayoffMatches.push({
                    id: crypto.randomUUID(),
                    leagueId: league.id,
                    homeTeamId: 'tbd_3rd_1',
                    awayTeamId: 'tbd_3rd_2',
                    date: playoffsFinalsDate,
                    scoreHome: null,
                    scoreAway: null,
                    scorers: [],
                    stage: 'third_place',
                    playoffKey: '3RD'
                });

                newPlayoffMatches.push({
                    id: crypto.randomUUID(),
                    leagueId: league.id,
                    homeTeamId: 'tbd_final_1',
                    awayTeamId: 'tbd_final_2',
                    date: playoffsFinalsDate,
                    scoreHome: null,
                    scoreAway: null,
                    scorers: [],
                    stage: 'final',
                    playoffKey: 'FINAL'
                });
            });

            if (newPlayoffMatches.length > 0) {
                await Promise.all(newPlayoffMatches.map(m => setDoc(doc(matchesRef, m.id), m)));
                showMessage(`Liguilla Final generada exitosamente. Semifinales: ${playoffsSemifinalDate}, Finales: ${playoffsFinalsDate}.`);
            } else {
                showMessage("No se generó la liguilla. Asegúrate de tener al menos 4 equipos por liga.");
            }
        } catch (e) {
            console.error("Error generating playoffs:", e);
            showMessage("Error al generar la liguilla final.");
        }
        setIsLoading(false);
    };

    const handleDeletePlayoffsSchedule = async () => {
        if (confirm("¿Estás seguro de que quieres eliminar todos los partidos de la Liguilla / Playoffs?")) {
            setIsLoading(true);
            const matchesRef = collection(db, `artifacts/${appId}/public/data/matches`);
            try {
                const visibleLeagueIds = visibleLeagues.map(l => l.id);
                const q = query(matchesRef, where("leagueId", "in", visibleLeagueIds));
                const existingDocs = await getDocs(q);
                const playoffDocs = existingDocs.docs.filter(d => d.data().stage && d.data().stage !== 'regular');
                await Promise.all(playoffDocs.map(d => deleteDoc(d.ref)));
                showMessage("Partidos de la Liguilla eliminados con éxito.");
            } catch (e) {
                console.error("Error deleting playoffs:", e);
                showMessage("Error al eliminar los partidos de la liguilla.");
            }
            setIsLoading(false);
        }
    };

    const StandingsView = () => {
        const isFiltered = Boolean(selectedStandingsLeagueFilter);
        const activeLeague = isFiltered ? visibleLeagues.find(l => l.id === selectedStandingsLeagueFilter) : null;
        const availableSports = Array.from(new Set(visibleLeagues.map(l => l.sport || 'Fútbol')));
        const sportsToDisplay = isFiltered && activeLeague
            ? [activeLeague.sport]
            : (availableSports.length > 0 ? availableSports : ['Fútbol', 'Básquetbol']);

        const sportGradients = {
            'Fútbol': 'from-emerald-800 via-teal-900 to-slate-950 shadow-emerald-900/30',
            'Básquetbol': 'from-amber-600 via-orange-700 to-slate-950 shadow-orange-900/30',
            'Tocho': 'from-teal-700 via-emerald-800 to-slate-950 shadow-teal-900/30',
            'Voleibol': 'from-purple-700 via-violet-900 to-slate-950 shadow-purple-900/30'
        };

        const sportEmojis = { 'Fútbol': '⚽️', 'Básquetbol': '🏀', 'Tocho': '🏈', 'Voleibol': '🏐' };

        const renderBannerForSport = (sport) => {
            const sportLeagues = isFiltered
                ? visibleLeagues.filter(l => l.id === selectedStandingsLeagueFilter)
                : visibleLeagues.filter(l => (l.sport || 'Fútbol') === sport);


            const sportLeagueIds = sportLeagues.map(l => l.id);
            const sportMatches = visibleMatches.filter(m => sportLeagueIds.includes(m.leagueId));

            const sportStandings = sportLeagues.flatMap(l => calculateStandings(l.id, visibleTeams, visibleMatches));
            let topTeamText = '-';
            let topTeamPtsText = 'Sin datos';

            if (sportStandings.length > 0) {
                const sortedStandings = [...sportStandings].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
                const topTeam = sortedStandings[0];
                if (topTeam && (topTeam.played > 0 || topTeam.points > 0)) {
                    const maxPoints = topTeam.points;
                    const maxDiff = topTeam.goalDifference;
                    const topTeams = sortedStandings.filter(t => t.points === maxPoints && t.goalDifference === maxDiff && (t.played > 0 || t.points > 0));
                    topTeamText = topTeams.map(t => t.teamName).join(', ');
                    topTeamPtsText = `${maxPoints} Pts`;
                } else if (topTeam) {
                    topTeamText = topTeam.teamName;
                    topTeamPtsText = '0 Pts (Sin partidos)';
                }
            }

            const sportScorers = sportLeagues.flatMap(l => calculateTopScorers(l.id, visibleMatches, visiblePlayers, visibleTeams));
            let topScorerText = '-';
            let topScorerGoalsText = 'Sin datos';
            const currentTerms = getSportTerms(sport);

            if (sportScorers.length > 0) {
                const sortedScorers = [...sportScorers].sort((a, b) => b.goals - a.goals);
                if (sortedScorers[0] && sortedScorers[0].goals > 0) {
                    const maxGoals = sortedScorers[0].goals;
                    const topScorersList = sortedScorers.filter(s => s.goals === maxGoals);
                    topScorerText = topScorersList.map(s => `${s.playerName} (${s.teamName})`).join(', ');
                    topScorerGoalsText = `${maxGoals} ${currentTerms.scorerHeader.toLowerCase()}`;
                } else {
                    topScorerText = 'Sin anotaciones';
                    topScorerGoalsText = `0 ${currentTerms.scorerHeader.toLowerCase()}`;
                }
            }

            const totalPlayedMatches = sportMatches.filter(m => m.scoreHome !== null && m.scoreHome !== undefined).length;
            const totalPointsScored = sportMatches.filter(m => m.scoreHome !== null && m.scoreHome !== undefined).reduce((sum, m) => sum + (m.scoreHome || 0) + (m.scoreAway || 0), 0);

            const leaderLabel = isFiltered ? "👑 Líder de Liga" : `👑 Líder ${sport}`;
            const scorerLabel = isFiltered ? `🎯 ${currentTerms.scorerSingular} de Liga` : `🎯 Líder ${currentTerms.scorerSingular}`;

            return (
                <div key={sport} className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${sportGradients[sport] || sportGradients['Fútbol']} p-6 sm:p-8 text-white shadow-2xl transition-all duration-500`}>
                    <div className="absolute -right-8 -bottom-8 text-8xl sm:text-9xl opacity-20 pointer-events-none animate-float">
                        {sportEmojis[sport] || '🏆'}
                    </div>
                    <div className="absolute right-1/4 top-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 space-y-3">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white border border-white/20">
                            <span>{sportEmojis[sport]} {sport}</span>
                            <span>•</span>
                            <span>{isFiltered && activeLeague ? activeLeague.name : 'Sports Hub Pro'}</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black font-outfit tracking-tight leading-tight">
                            Torneo de <span className="text-amber-300">{sport}</span>
                        </h2>
                        <p className="text-blue-100 text-xs sm:text-sm max-w-md">
                            Clasificación, resultados en vivo y tabla de {currentTerms.scorerPlural.toLowerCase()} oficiales.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-white/15 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 hover:bg-white/20 transition-all">
                            <p className="text-[11px] text-blue-100 font-semibold uppercase tracking-wider">{leaderLabel}</p>
                            <p className="text-base font-bold truncate mt-0.5" title={topTeamText}>{topTeamText}</p>
                            <p className="text-xs text-amber-300 font-mono mt-0.5">{topTeamPtsText}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 hover:bg-white/20 transition-all">
                            <p className="text-[11px] text-blue-100 font-semibold uppercase tracking-wider">{scorerLabel}</p>
                            <p className="text-base font-bold truncate mt-0.5" title={topScorerText}>{topScorerText}</p>
                            <p className="text-xs text-amber-300 font-mono mt-0.5">{topScorerGoalsText}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 hover:bg-white/20 transition-all">
                            <p className="text-[11px] text-blue-100 font-semibold uppercase tracking-wider">🏟️ Partidos</p>
                            <p className="text-xl font-black mt-0.5">{totalPlayedMatches}</p>
                            <p className="text-[11px] text-blue-100 mt-0.5">{isFiltered ? 'En esta liga' : 'Jugados'}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 hover:bg-white/20 transition-all">
                            <p className="text-[11px] text-blue-100 font-semibold uppercase tracking-wider">⚡ {currentTerms.scorerHeader}</p>
                            <p className="text-xl font-black mt-0.5">{totalPointsScored}</p>
                            <p className="text-[11px] text-blue-100 mt-0.5">{currentTerms.scorerHeader} en {sport}</p>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="space-y-6">
                {tournaments.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">🏆</span>
                            <label className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Torneo Activo:</label>
                        </div>
                        <select value={selectedTournamentId} onChange={(e) => setSelectedTournamentId(e.target.value)} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-gray-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#101097]">
                            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                )}

                {activeTournament?.inaugurationDate ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700/60 p-4 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
                        <span className="text-2xl">ℹ️</span>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                            <strong>Información Oficial:</strong> La Clasificación y Goleo oficial contabilizan únicamente los partidos a partir de la <strong>Inauguración Deportiva ({activeTournament.inaugurationDate})</strong>. Los partidos previos son considerados <strong>Amistosos</strong>.
                        </p>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-amber-900/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
                            <strong>Partidos Amistosos en curso:</strong> Aún no se ha definido la <strong>Fecha de Inauguración Deportiva</strong>. Todos los partidos actuales se juegan como <strong>Amistosos</strong> y la Tabla de Clasificación comenzará a contabilizar puntos a partir del día del evento inaugural.
                        </p>
                    </div>
                )}

                <div className={`grid grid-cols-1 ${sportsToDisplay.length > 1 ? 'lg:grid-cols-2' : ''} gap-6`}>
                    {sportsToDisplay.map(sport => renderBannerForSport(sport))}
                </div>

                {tournaments.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay torneos creados. Pídele a un administrador que cree uno.</p>
                )}

                {tournaments.length > 0 && visibleLeagues.length === 0 && (
                    <p className="text-center text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded-lg shadow-md">No hay ligas en el torneo seleccionado.</p>
                )}

                {visibleLeagues.length > 0 && (
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                            <span className="mr-2 text-lg">🔍</span> Filtrar por Liga:
                        </label>
                        <select value={selectedStandingsLeagueFilter} onChange={(e) => setSelectedStandingsLeagueFilter(e.target.value)} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold shadow-sm focus:ring-2 focus:ring-[#101097]">
                            <option value="">Ver Todas las Ligas</option>
                            {visibleLeagues.sort(sortLeagues).map(league => <option key={league.id} value={league.id}>{league.name}</option>)}
                        </select>
                    </div>
                )}

                {visibleLeagues.filter(l => selectedStandingsLeagueFilter ? l.id === selectedStandingsLeagueFilter : true).sort(sortLeagues).map(league => (
                    <div key={league.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl space-y-4 border-t-4 border-[#101097] border-x border-b border-gray-100 dark:border-gray-700/60">
                        <h3 className="text-2xl font-black font-outfit text-gray-900 dark:text-white flex items-center justify-between border-b dark:border-gray-700 pb-3">
                            <span className="flex items-center">
                                <span className="mr-2 text-2xl">{getSportScoringInfo(league.sport).emoji}</span>
                                {league.name}
                            </span>
                            {league.sport && <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#101097] dark:text-blue-300 border border-blue-200 dark:border-blue-800">{league.sport}</span>}
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-2">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">Tabla de Posiciones</h4>
                                <StandingsTable standings={calculateStandings(league.id, visibleTeams, visibleMatches)} sport={league.sport} onViewTeamDetails={handleViewTeamDetails} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">Tabla de Goleadores</h4>
                                <TopScorersTable scorers={calculateTopScorers(league.id, visibleMatches, visiblePlayers, visibleTeams)} sport={league.sport} />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Últimos Resultados</h4>
                            <ResultsList matches={visibleMatches.filter(m => m.leagueId === league.id)} getTeamName={getTeamName} getTeamLogo={getTeamLogo} onMatchClick={handleMatchClick} onViewTeamDetails={handleViewTeamDetails} getMatchBadge={getMatchBadge} />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const AdminPanel = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl space-y-6 border-t-4 border-[#101097]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-gray-700 pb-4">
                    <div>
                        <h2 className="text-3xl font-black font-outfit text-gray-900 dark:text-white">Panel de Administrador</h2>
                    </div>
                    <div className="flex items-center overflow-x-auto max-w-full bg-gray-100 dark:bg-gray-700/60 p-1.5 rounded-2xl gap-1 scrollbar-none">
                        <button onClick={() => setAdminTab('tournaments')} className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${adminTab === 'tournaments' ? 'bg-[#101097] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                            🏆 Torneos
                        </button>
                        <button onClick={() => setAdminTab('teams')} className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${adminTab === 'teams' || adminTab === 'leagues' ? 'bg-[#101097] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                            👥 Plantillas & Equipos
                        </button>
                        <button onClick={() => setAdminTab('schedule')} className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${adminTab === 'schedule' ? 'bg-[#101097] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                            ⚽ Calendario & Partidos
                        </button>
                        <button onClick={() => setAdminTab('reports')} className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${adminTab === 'reports' ? 'bg-[#101097] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                            📄 Reportes PDF
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/60 dark:to-gray-700/40 p-4 rounded-2xl border border-blue-100 dark:border-gray-600 shadow-sm">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl">🏆</span>
                        <div>
                            <label className="text-xs font-bold text-[#101097] dark:text-blue-300 uppercase tracking-wider block">Torneo Activo (Administrador)</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Selecciona el torneo sobre el cual estás trabajando</p>
                        </div>
                    </div>
                    {tournaments.length > 0 ? (
                        <select 
                            value={selectedTournamentId} 
                            onChange={(e) => setSelectedTournamentId(e.target.value)} 
                            className="bg-white dark:bg-gray-800 border-2 border-[#101097]/40 dark:border-blue-500/50 rounded-xl px-4 py-2 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#101097] shadow-sm cursor-pointer w-full sm:w-auto"
                        >
                            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    ) : (
                        <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">No hay torneos creados</span>
                    )}
                </div>

                {adminTab === 'tournaments' && (
                    <div className="space-y-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl sm:text-2xl font-bold font-outfit text-[#101097] dark:text-blue-300 flex items-center">
                            <span className="mr-2">🏆</span> Gestión de Torneos
                        </h3>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button onClick={createLeaguesAndTeams} className="btn-primary flex items-center justify-center text-xs sm:text-sm py-2.5 px-4">
                                <PlusIcon className="w-4 h-4 mr-2" /> Crear Nuevo Torneo
                            </button>
                            <button onClick={handleDeleteTournament} className="btn-danger flex items-center justify-center text-xs sm:text-sm py-2.5 px-4" disabled={!selectedTournamentId}>
                                <TrashIcon className="w-4 h-4 mr-2" /> Eliminar Torneo Actual
                            </button>
                        </div>
                    </div>
                )}

                {(adminTab === 'teams' || adminTab === 'leagues') && (
                    <div className="space-y-4">
                        {visibleLeagues.map(league => (
                            <LeagueCard
                                key={league.id}
                                league={league}
                                teams={visibleTeams.filter(t => t.leagueId === league.id)}
                                players={visiblePlayers}
                                matches={visibleMatches}
                                appId={appId}
                                db={db}
                                showMessage={showMessage}
                                onMatchDayChange={handleMatchDayChange}
                                onThemeChange={handleThemeChange}
                                onApplyThemeTeams={handleApplyThemeTeams}
                                onEditTeam={(t) => setEditingTeam(t)}
                                onAddPlayers={(t) => setAddingPlayersTeam(t)}
                                onAddTeam={handleAddTeam}
                                onDeleteTeam={handleDeleteTeam}
                            />
                        ))}
                    </div>
                )}

                {adminTab === 'schedule' && (
                    <div className="space-y-6">
                        <div className="space-y-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl sm:text-2xl font-bold font-outfit text-[#101097] dark:text-blue-300 flex items-center">
                                <span className="mr-2">📅</span> Generador de Calendario Escolar
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Genera automáticamente los partidos de todos los viernes (y la jornada sabatina de inauguración si está definida) desde la fecha de inicio hasta junio.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5 w-full">
                                    <label htmlFor="schedule-start" className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Fecha de Inicio del Torneo (Viernes)
                                    </label>
                                    <input id="schedule-start" type="date" value={scheduleStartDate} onChange={e => setScheduleStartDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium shadow-sm" />
                                </div>
                                <div className="space-y-1.5 w-full">
                                    <label htmlFor="inauguration-date" className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                                        🎉 Inauguración Deportiva (Sábado)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            id="inauguration-date" 
                                            type="date" 
                                            value={tournaments.find(t => t.id === selectedTournamentId)?.inaugurationDate || ''} 
                                            onChange={e => handleUpdateInaugurationDate(e.target.value)} 
                                            className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium shadow-sm" 
                                        />
                                        {tournaments.find(t => t.id === selectedTournamentId)?.inaugurationDate && (
                                            <button 
                                                onClick={() => handleUpdateInaugurationDate('')}
                                                className="px-3 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl border border-red-300 dark:border-red-700 transition-all shadow-sm whitespace-nowrap"
                                                title="Quitar la fecha de inauguración"
                                            >
                                                ❌ Quitar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                                <button onClick={() => generateSchedule(visibleLeagues, visibleTeams)} className="btn-primary py-2.5 px-6 shadow-md flex items-center justify-center text-xs sm:text-sm">
                                    ⚡ Generar Calendario Escolar (con Inauguración)
                                </button>
                                <button onClick={() => handleDeleteSchedule(visibleLeagueIds)} className="btn-danger py-2.5 px-6 shadow-md flex items-center justify-center text-xs sm:text-sm">
                                    🗑️ Borrar Calendario
                                </button>
                            </div>
                        </div>

                        <InteractiveCalendar 
                            matches={visibleMatches} 
                            selectedDateFilter={selectedDateFilter} 
                            onSelectDate={setSelectedDateFilter} 
                            activeTournament={activeTournament} 
                        />

                        <div className="space-y-4 p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800/80 dark:to-gray-800 rounded-2xl shadow-sm border border-indigo-100 dark:border-gray-700">
                            <h3 className="text-xl sm:text-2xl font-bold font-outfit text-purple-900 dark:text-purple-300 flex items-center">
                                <span className="mr-2">🏆</span> Generador de Liguilla Final (Playoffs 1-4)
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Crea automáticamente la fase eliminatoria por el título (1° vs 4° y 2° vs 3° en Semifinales, seguido de Gran Final y Partido por 3er Lugar) para todas las ligas activas.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                                <div className="space-y-1.5">
                                    <label className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                                        🔥 Fecha de Semifinales (1° vs 4° y 2° vs 3°)
                                    </label>
                                    <input
                                        type="date"
                                        value={playoffsSemifinalDate}
                                        onChange={e => setPlayoffsSemifinalDate(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                                        👑 Fecha de Gran Final y 3er Lugar
                                    </label>
                                    <input
                                        type="date"
                                        value={playoffsFinalsDate}
                                        onChange={e => setPlayoffsFinalsDate(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                                        ⚖️ Criterio de Desempate en Empate
                                    </label>
                                    <select
                                        value={playoffTiebreakerRule}
                                        onChange={e => setPlayoffTiebreakerRule(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-bold text-gray-900 dark:text-white shadow-sm"
                                    >
                                        <option value="penalties">🥅 Penales (Definición por Penaltis)</option>
                                        <option value="position">📊 Mejor Posición en Tabla Regular</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                                <button onClick={generatePlayoffsSchedule} className="bg-gradient-to-r from-purple-600 to-[#101097] text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:from-purple-700 hover:to-[#001E61] transition-all flex items-center justify-center text-xs sm:text-sm">
                                    🏆 Generar Liguilla Final (Playoffs)
                                </button>
                                <button onClick={handleDeletePlayoffsSchedule} className="px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl border border-red-300 dark:border-red-700 transition-all shadow-sm text-center">
                                    🗑️ Borrar Liguilla
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl sm:text-2xl font-bold font-outfit text-[#101097] dark:text-blue-300 flex items-center">
                                <span className="mr-2">⚽</span> Administrar Partidos y Marcadores
                            </h3>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <select value={selectedLeagueFilter} onChange={(e) => setSelectedLeagueFilter(e.target.value)} className="p-2.5 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-700 text-xs sm:text-sm shadow-sm w-full sm:w-auto">
                                    <option value="">Filtrar por Liga</option>
                                    {visibleLeagues.sort(sortLeagues).map(league => <option key={league.id} value={league.id}>{league.name}</option>)}
                                </select>
                                <select value={selectedDateFilter} onChange={(e) => setSelectedDateFilter(e.target.value)} className="p-2.5 rounded-xl border dark:border-gray-600 bg-white dark:bg-gray-700 text-xs sm:text-sm shadow-sm w-full sm:w-auto">
                                    <option value="">Filtrar por Fecha</option>
                                    {[...new Set(visibleMatches.map(m => m.date))].sort().map(date => <option key={date} value={date}>{date}</option>)}
                                </select>
                            </div>
                            <MatchesView
                                matches={visibleMatches}
                                getTeamName={getTeamName}
                                appId={appId}
                                db={db}
                                showMessage={showMessage}
                                leagues={leagues}
                                teams={teams}
                                players={players}
                                getLeagueName={getLeagueName}
                                getPlayersByTeam={getPlayersByTeam}
                                selectedDateFilter={selectedDateFilter}
                                selectedLeagueFilter={selectedLeagueFilter}
                                user={user}
                                getMatchBadge={getMatchBadge}
                                tournaments={tournaments}
                                selectedTournamentId={selectedTournamentId}
                            />
                        </div>
                    </div>
                )}


                {adminTab === 'reports' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-2">
                                <label className="font-bold text-sm block">Próximos Partidos por Fecha</label>
                                <select value={upcomingMatchesDate} onChange={e => setUpcomingMatchesDate(e.target.value)} className="w-full p-2 rounded-lg border text-sm">
                                    <option value="">-- Seleccionar Fecha --</option>
                                    {[...new Set(visibleMatches.map(m => m.date))].sort().map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <button onClick={() => generateUpcomingMatchesPdf({ visibleMatches, upcomingMatchesDate, tournaments, selectedTournamentId, leagues, getTeamLogo, getTeamName, getLeagueName, showMessage })} className="btn-primary w-full mt-2 text-xs py-2" disabled={!upcomingMatchesDate}>Generar PDF</button>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-2">
                                <label className="font-bold text-sm block">Cédula de Árbitro</label>
                                <select value={refereeMatchDate} onChange={e => setRefereeMatchDate(e.target.value)} className="w-full p-2 rounded-lg border text-sm">
                                    <option value="">-- Seleccionar Fecha --</option>
                                    {[...new Set(visibleMatches.map(m => m.date))].sort().map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <button onClick={() => generateRefereeSheetPdf({ visibleMatches, visiblePlayers, refereeMatchDate, leagues, getLeagueName, getTeamName, getTeamLogo, getPlayersByTeam, showMessage })} className="btn-primary w-full mt-2 text-xs py-2" disabled={!refereeMatchDate}>Generar PDF</button>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-2">
                                <label className="font-bold text-sm block">Clasificación y Goleo</label>
                                <button onClick={() => generateStandingsAndTopScorersPdf({ visibleLeagues, visibleTeams, visibleMatches, visiblePlayers, tournaments, selectedTournamentId, calculateStandings, calculateTopScorers, showMessage })} className="btn-primary w-full mt-2 text-xs py-2">Generar PDF Completo</button>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-2">
                                <label className="font-bold text-sm block">Listas de Equipos por Deporte</label>
                                <select value={rosterSport} onChange={e => setRosterSport(e.target.value)} className="w-full p-2 rounded-lg border text-sm">
                                    <option value="">-- Seleccionar Deporte --</option>
                                    {[...new Set(visibleLeagues.map(l => l.sport))].sort().map(sport => <option key={sport} value={sport}>{sport}</option>)}
                                </select>
                                <button onClick={() => generateTeamRostersPdf({ selectedSport: rosterSport, visibleLeagues, visibleTeams, visiblePlayers, showMessage })} className="btn-primary w-full mt-2 text-xs py-2">Generar PDF</button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-[#101097] to-slate-900 text-white rounded-2xl shadow-xl space-y-4 border border-blue-900/50">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold font-outfit text-white flex items-center">
                                    <span className="mr-2">📱</span> Resumen Multi-Deporte para Redes Sociales
                                </h3>
                                <p className="text-xs text-blue-200 mt-1">
                                    Genera pósters gráficos HD y resúmenes formateados de Fútbol y Básquetbol para publicar en Facebook.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <button onClick={() => printFacebookSummaryWindow(visibleMatches, visibleLeagues, visibleTeams, visiblePlayers, selectedDateFilter, 'ALL', 'Primaria Tuxtla', showMessage)} className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 font-black rounded-xl text-slate-950 text-xs shadow-md text-center">
                                    🏆 Póster Combinado
                                </button>
                                <button onClick={() => printFacebookSummaryWindow(visibleMatches, visibleLeagues, visibleTeams, visiblePlayers, selectedDateFilter, 'Fútbol', 'Primaria Tuxtla', showMessage)} className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-white text-xs shadow-md text-center">
                                    ⚽ Póster Fútbol
                                </button>
                                <button onClick={() => printFacebookSummaryWindow(visibleMatches, visibleLeagues, visibleTeams, visiblePlayers, selectedDateFilter, 'Básquetbol', 'Primaria Tuxtla', showMessage)} className="py-2.5 px-4 bg-orange-600 hover:bg-orange-700 font-bold rounded-xl text-white text-xs shadow-md text-center">
                                    🏀 Póster Básquetbol
                                </button>
                                <button onClick={() => copyFacebookSummaryText(visibleMatches, visibleLeagues, visibleTeams, visiblePlayers, selectedDateFilter, getTeamName, showMessage, 'PRIMARIA')} className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold rounded-xl text-white text-xs shadow-md text-center">
                                    📋 Copiar Texto Completo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderView = () => {
        if (isLoading && !isAuthReady) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-[#101097]"></div>
                    <p className="mt-4 text-[#101097] dark:text-blue-300 text-lg font-semibold">Cargando Datos...</p>
                </div>
            );
        }
        switch (view) {
            case 'standings': return <StandingsView />;
            case 'playoffs': return <PlayoffsBracketView leagues={leagues} teams={teams} matches={matches} selectedTournamentId={selectedTournamentId} onViewTeamDetails={handleViewTeamDetails} />;
            case 'admin': return user ? <AdminPanel /> : (
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border-t-4 border-[#101097] mx-4">
                        <h3 className="text-xl sm:text-2xl font-bold mb-3">Acceso de Administrador</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">Inicia sesión para administrar los torneos.</p>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" className="w-full p-3 mb-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#101097]" placeholder="Correo electrónico" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }} className="w-full p-3 mb-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#101097]" placeholder="Contraseña" />
                        <button onClick={handleLogin} className="btn-primary w-full py-2.5">Ingresar</button>
                    </div>
                </div>
            );
            case 'teamDetail': return <TeamDetailView teamId={selectedTeamIdForDetail} teams={teams} players={players} matches={matches} getLeagueName={getLeagueName} getTeamName={getTeamName} getTeamLogo={getTeamLogo} onViewMatchDetails={handleMatchClick} onBack={() => setView('standings')} />;
            default: return <StandingsView />;
        }
    };

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
        if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', nextTheme);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
            <nav className="bg-[#101097] dark:bg-[#001E61] p-3 sm:p-4 shadow-xl sticky top-0 z-40 border-b border-white/10 backdrop-blur-md">
                <div className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-2.5 sm:gap-4">
                    <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setView('standings')}>
                        <img src="https://i.imgur.com/pbiHVPL.png" alt="La Salle Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md" />
                        <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight block font-outfit">Ligas La Salle</span>
                        <span className="bg-white/20 text-white text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-white/20 shadow-sm">PRIMARIA</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto justify-center pb-0.5 sm:pb-0 scrollbar-none">
                        <button onClick={() => setView('standings')} className={`nav-button text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap ${view === 'standings' ? 'bg-white/20 font-bold' : ''}`}>
                            <TrophyIcon className="inline-block w-4 h-4 mr-1 text-white" />Clasificación
                        </button>
                        <button onClick={() => setView('playoffs')} className={`nav-button text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap ${view === 'playoffs' ? 'bg-white/20 font-bold' : ''}`}>
                            <span className="inline-block mr-1 text-white">🏆</span>Playoffs
                        </button>
                        <button onClick={() => setView('admin')} className={`nav-button text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap ${view === 'admin' ? 'bg-white/20 font-bold' : ''}`}>
                            <LockClosedIcon className="inline-block w-4 h-4 mr-1 text-white" />Admin
                        </button>
                        {user && (
                            <button onClick={handleLogout} className="nav-button text-white bg-red-600 hover:bg-red-700 font-bold px-2.5 sm:px-3 py-1.5 rounded-full shadow-md text-xs whitespace-nowrap transition-all">Cerrar Sesión</button>
                        )}
                        <button onClick={toggleTheme} className="p-1.5 sm:p-2 rounded-full text-white hover:bg-white/20 transition-all ml-0.5" title="Cambiar tema">
                            {theme === 'light' ? <MoonIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <SunIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />}
                        </button>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
                {renderView()}
            </main>
            <MatchDetailsModal match={matchDetails} leagues={leagues} onClose={() => setMatchDetails(null)} getPlayerName={getPlayerName} getTeamName={getTeamName} />
            <EditTeamModal team={editingTeam} leagueTheme={leagues.find(l => l.id === editingTeam?.leagueId)?.theme} onClose={() => setEditingTeam(null)} onSave={handleUpdateTeam} showMessage={showMessage} />
            <AddPlayersModal team={addingPlayersTeam} onClose={() => setAddingPlayersTeam(null)} onAdd={handleAddMultiplePlayers} showMessage={showMessage} />
        </div>
    );
};

export default App;
