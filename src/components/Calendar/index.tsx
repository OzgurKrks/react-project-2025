/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";

import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";

import FullCalendar from "@fullcalendar/react";

import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";

import type { EventInput } from "@fullcalendar/core/index.js";

import "../profileCalendar.scss";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useDispatch } from "react-redux";
import { updateAssignment } from "../../store/schedule/actions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
};

const classes = [
  "bg-one",
  "bg-two",
  "bg-three",
  "bg-four",
  "bg-five",
  "bg-six",
  "bg-seven",
  "bg-eight",
  "bg-nine",
  "bg-ten",
  "bg-eleven",
  "bg-twelve",
  "bg-thirteen",
  "bg-fourteen",
  "bg-fifteen",
  "bg-sixteen",
  "bg-seventeen",
  "bg-eighteen",
  "bg-nineteen",
  "bg-twenty",
  "bg-twenty-one",
  "bg-twenty-two",
  "bg-twenty-three",
  "bg-twenty-four",
  "bg-twenty-five",
  "bg-twenty-six",
  "bg-twenty-seven",
  "bg-twenty-eight",
  "bg-twenty-nine",
  "bg-thirty",
  "bg-thirty-one",
  "bg-thirty-two",
  "bg-thirty-three",
  "bg-thirty-four",
  "bg-thirty-five",
  "bg-thirty-six",
  "bg-thirty-seven",
  "bg-thirty-eight",
  "bg-thirty-nine",
  "bg-forty",
];

const CalendarContainer = ({ schedule, auth }: CalendarContainerProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const dispatch = useDispatch();

  const [events, setEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [pairDates, setPairDates] = useState<
    { date: string; color: string; staffId: string; staffName: string }[]
  >([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

  // Confirm modal için state'ler
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingEventDrop, setPendingEventDrop] = useState<any>(null);

  const getFirstEventDate = () => {
    if (schedule?.assignments?.length > 0) {
      const sortedAssignments = [...schedule.assignments].sort((a, b) => {
        const dateA = dayjs.utc(a.shiftStart);
        const dateB = dayjs.utc(b.shiftStart);
        return dateA.valueOf() - dateB.valueOf();
      });

      const firstAssignment = sortedAssignments[0];
      return dayjs.utc(firstAssignment.shiftStart).toDate();
    }
    return new Date();
  };

  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (schedule?.assignments?.length > 0) {
      setCalendarKey((prev) => prev + 1);
      initialLoadRef.current = false;
    }

    const selectedStaff = schedule?.staffs?.find(
      (staff) => staff.id === schedule?.staffs?.[0]?.id
    );
    console.log("Seçili personel:", selectedStaff);
    console.log("PairList yapısı:", selectedStaff?.pairList);

    generateStaffBasedCalendar();
  }, [schedule]);

  const getPlugins = () => {
    const plugins = [dayGridPlugin];

    plugins.push(interactionPlugin);
    return plugins;
  };

  const getShiftById = (id: string) => {
    return schedule?.shifts?.find((shift: { id: string }) => id === shift.id);
  };

  const getAssigmentById = (id: string) => {
    return schedule?.assignments?.find((assign) => id === assign.id);
  };

  const getStaffById = (id: string) => {
    return schedule?.staffs?.find((staff) => id === staff.id);
  };

  const validDates = () => {
    const dates = [];
    let currentDate = dayjs(schedule.scheduleStartDate);
    while (
      currentDate.isBefore(schedule.scheduleEndDate) ||
      currentDate.isSame(schedule.scheduleEndDate)
    ) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  const getDatesBetween = (startDate: string, endDate: string) => {
    const dates = [];
    const start = dayjs(startDate, "DD.MM.YYYY").toDate();
    const end = dayjs(endDate, "DD.MM.YYYY").toDate();
    const current = new Date(start);

    while (current <= end) {
      dates.push(dayjs(current).format("DD-MM-YYYY"));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const generateStaffBasedCalendar = () => {
    const works: EventInput[] = [];

    for (let i = 0; i < schedule?.assignments?.length; i++) {
      if (
        selectedStaffId &&
        schedule?.assignments?.[i]?.staffId !== selectedStaffId
      ) {
        continue;
      }

      const className = schedule?.shifts?.findIndex(
        (shift) => shift.id === schedule?.assignments?.[i]?.shiftId
      );

      const assignmentDate = dayjs
        .utc(schedule?.assignments?.[i]?.shiftStart)
        .format("YYYY-MM-DD");
      const isValidDate = validDates().includes(assignmentDate);

      const work = {
        id: schedule?.assignments?.[i]?.id,
        title: getShiftById(schedule?.assignments?.[i]?.shiftId)?.name,
        duration: "01:00",
        date: assignmentDate,
        staffId: schedule?.assignments?.[i]?.staffId,
        shiftId: schedule?.assignments?.[i]?.shiftId,
        className: `event ${classes[className]} ${
          getAssigmentById(schedule?.assignments?.[i]?.id)?.isUpdated
            ? "highlight"
            : ""
        } ${!isValidDate ? "invalid-date" : ""}`,
        extendedProps: {
          staff: getStaffById(schedule?.assignments?.[i]?.staffId),
          shift: getShiftById(schedule?.assignments?.[i]?.shiftId),
          startTime: dayjs
            .utc(schedule?.assignments?.[i]?.shiftStart)
            .format("HH:mm"),
          endTime: dayjs
            .utc(schedule?.assignments?.[i]?.shiftEnd)
            .format("HH:mm"),
        },
      };
      works.push(work);
    }

    const offDays = schedule?.staffs?.find(
      (staff) => staff.id === selectedStaffId
    )?.offDays;

    const pairDatesList: {
      date: string;
      color: string;
      staffId: string;
      staffName: string;
    }[] = [];

    if (selectedStaffId) {
      const selectedStaffDates = schedule?.assignments
        ?.filter((assignment) => assignment.staffId === selectedStaffId)
        ?.map((assignment) => {
          return dayjs.utc(assignment.shiftStart).format("YYYY-MM-DD");
        });

      console.log("Seçili personel vardiya tarihleri:", selectedStaffDates);

      schedule?.staffs?.forEach((staff, staffIndex) => {
        if (staff.id === selectedStaffId) return;

        const staffAssignments = schedule?.assignments?.filter(
          (assignment) => assignment.staffId === staff.id
        );

        staffAssignments?.forEach((assignment) => {
          const assignmentDate = dayjs
            .utc(assignment.shiftStart)
            .format("YYYY-MM-DD");

          if (selectedStaffDates?.includes(assignmentDate)) {
            const color = classes[staffIndex % classes.length];

            pairDatesList.push({
              date: dayjs(assignmentDate).format("DD-MM-YYYY"),
              color: color,
              staffId: staff.id,
              staffName: staff.name,
            });
          }
        });
      });

      console.log("Hesaplanan pair günleri:", pairDatesList);
    }

    const dates = getDatesBetween(
      dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
      dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
    );

    let highlightedDates: string[] = [];

    dates.forEach((date) => {
      const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
      if (offDays?.includes(transformedDate)) highlightedDates.push(date);
    });

    setHighlightedDates(highlightedDates);
    setPairDates(pairDatesList);
    setEvents(works);
  };

  useEffect(() => {
    generateStaffBasedCalendar();
  }, [selectedStaffId]);

  const RenderEventContent = ({ eventInfo }: any) => {
    return (
      <div
        className="event-content"
        onClick={() => {
          setSelectedEvent(eventInfo.event);
          setShowEventModal(true);
        }}
      >
        <p>
          <i className="event-time">
            {eventInfo.event.extendedProps.startTime}
          </i>{" "}
          {eventInfo.event.title}
        </p>
      </div>
    );
  };

  const EventModal = () => {
    if (!showEventModal || !selectedEvent) return null;

    return (
      <div
        className="event-modal-overlay"
        onClick={() => setShowEventModal(false)}
      >
        <div className="event-modal" onClick={(e) => e.stopPropagation()}>
          <div className="event-modal-header">
            <h3>{selectedEvent.title}</h3>
          </div>
          <div className="event-details">
            <p>
              <strong>Personel:</strong>
              <span>{selectedEvent.extendedProps.staff?.name}</span>
            </p>
            <p>
              <strong>Vardiya:</strong>
              <span>{selectedEvent.extendedProps.shift?.name}</span>
            </p>
            <p>
              <strong>Tarih:</strong>
              <span>{dayjs(selectedEvent.date).format("DD.MM.YYYY")}</span>
            </p>
            <p>
              <strong>Başlangıç:</strong>
              <span>{selectedEvent.extendedProps.startTime}</span>
            </p>
            <p>
              <strong>Bitiş:</strong>
              <span>{selectedEvent.extendedProps.endTime}</span>
            </p>
          </div>
          <div className="event-modal-footer">
            <button onClick={() => setShowEventModal(false)}>Kapat</button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // LocalStorage'dan kaydedilmiş değişiklikleri ve seçili personeli yükle
    const loadSavedChanges = () => {
      try {
        // Kaydedilmiş değişiklikleri yükle
        const savedChanges = localStorage.getItem("calendarChanges");
        if (savedChanges) {
          const changes = JSON.parse(savedChanges);

          // Değişiklikleri Redux store'a gönder
          changes.forEach((change: any) => {
            dispatch(updateAssignment({ assignment: change }) as any);
          });
        }

        // Kaydedilmiş seçili personeli yükle
        const savedStaffId = localStorage.getItem("selectedStaffId");
        if (savedStaffId) {
          // Personel ID'si geçerliyse (schedule içinde varsa) yükle
          const staffExists = schedule?.staffs?.some(
            (staff) => staff.id === savedStaffId
          );
          if (staffExists) {
            setSelectedStaffId(savedStaffId);
          } else {
            // Eğer kaydedilmiş personel artık mevcut değilse, ilk personeli seç
            setSelectedStaffId(schedule?.staffs?.[0]?.id);
            // Geçersiz personel ID'sini localStorage'dan temizle
            localStorage.removeItem("selectedStaffId");
          }
        } else {
          // Kaydedilmiş personel yoksa, ilk personeli seç
          setSelectedStaffId(schedule?.staffs?.[0]?.id);
        }
      } catch (error) {
        console.error("Kaydedilmiş bilgileri yükleme hatası:", error);
        // Hata durumunda ilk personeli seç
        setSelectedStaffId(schedule?.staffs?.[0]?.id);
      }
    };

    // Sayfa ilk yüklendiğinde değişiklikleri ve seçili personeli yükle
    if (schedule?.assignments?.length > 0) {
      loadSavedChanges();
    } else {
      // Schedule yüklenmediyse en azından ilk personeli seç
      setSelectedStaffId(schedule?.staffs?.[0]?.id);
    }
  }, [schedule?.scheduleId]); // Schedule ID değiştiğinde çalıştır

  // Etkinliğin sürüklenmesi tamamlandığında çalışacak fonksiyon
  const handleEventDrop = (info: any) => {
    // Sürüklenme işlemini beklet ve onay modalını göster
    setPendingEventDrop(info);
    setShowConfirmModal(true);
  };

  // Onay modalında "Evet" tıklandığında
  const confirmEventDrop = () => {
    if (!pendingEventDrop) return;

    const { event } = pendingEventDrop;

    // Etkinliğin yeni tarihi
    const newDate = dayjs(event.start).format("YYYY-MM-DD");

    // Etkinliğin ID'si ile schedule verisinden assignment'ı bul
    const assignmentId = event.id;
    const assignment = schedule.assignments.find((a) => a.id === assignmentId);

    if (assignment) {
      // Yeni başlangıç ve bitiş saatleri hesapla
      const originalStart = dayjs.utc(assignment.shiftStart);
      const originalEnd = dayjs.utc(assignment.shiftEnd);

      // Sadece tarihi değiştir, saati koru
      const newStartDate = dayjs(newDate).format("YYYY-MM-DD");
      const newStartTime = originalStart.format("HH:mm:ss");
      const newStart = `${newStartDate}T${newStartTime}Z`;

      // Bitiş saati için de benzer hesaplama
      const newEndDate = dayjs(newDate).format("YYYY-MM-DD");
      const newEndTime = originalEnd.format("HH:mm:ss");
      const newEnd = `${newEndDate}T${newEndTime}Z`;

      // Güncellenmiş assignment objesi
      const updatedAssignment = {
        ...assignment,
        shiftStart: newStart,
        shiftEnd: newEnd,
        isUpdated: true,
      };

      // Redux action gönder
      dispatch(updateAssignment({ assignment: updatedAssignment }) as any);

      // Değişikliği localStorage'a kaydet
      saveChangesToLocalStorage(updatedAssignment);

      // Bildirim göster
      toast.success("Etkinlik başarıyla taşındı");

      console.log("Etkinlik taşındı:", updatedAssignment);
    }

    // Modal'ı kapat
    setShowConfirmModal(false);
    setPendingEventDrop(null);
  };

  // Onay modalında "Hayır" tıklandığında
  const cancelEventDrop = () => {
    // Sürükleme işlemini geri al
    if (pendingEventDrop) {
      pendingEventDrop.revert();
    }

    // Modal'ı kapat
    setShowConfirmModal(false);
    setPendingEventDrop(null);

    // Bildirim göster
    toast.info("İşlem iptal edildi");
  };

  // Değişiklikleri localStorage'a kaydet
  const saveChangesToLocalStorage = (updatedAssignment: any) => {
    try {
      // Önceki değişiklikleri al
      const savedChangesStr = localStorage.getItem("calendarChanges") || "[]";
      const savedChanges = JSON.parse(savedChangesStr);

      // Bu assignment daha önce değiştirilmiş mi kontrol et
      const existingIndex = savedChanges.findIndex(
        (change: any) => change.id === updatedAssignment.id
      );

      if (existingIndex >= 0) {
        // Varsa güncelle
        savedChanges[existingIndex] = updatedAssignment;
      } else {
        // Yoksa ekle
        savedChanges.push(updatedAssignment);
      }

      // LocalStorage'a kaydet
      localStorage.setItem("calendarChanges", JSON.stringify(savedChanges));
    } catch (error) {
      console.error("Değişiklikleri kaydetme hatası:", error);
    }
  };

  // Confirm Modal Bileşeni
  const ConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="confirm-modal-overlay">
        <div className="confirm-modal">
          <div className="confirm-modal-header">
            <h3>Değişikliği Onaylıyor musunuz?</h3>
          </div>
          <div className="confirm-modal-body">
            <p>Bu etkinliği taşımak istediğinize emin misiniz?</p>
          </div>
          <div className="confirm-modal-footer">
            <button className="confirm-yes-btn" onClick={confirmEventDrop}>
              Evet
            </button>
            <button className="confirm-no-btn" onClick={cancelEventDrop}>
              Hayır
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Personel seçildiğinde çalışacak fonksiyon
  const handleStaffSelection = (staffId: string) => {
    // Seçili personeli state'e kaydet
    setSelectedStaffId(staffId);

    // Seçili personeli localStorage'a kaydet
    localStorage.setItem("selectedStaffId", staffId);
  };

  return (
    <div className="calendar-section">
      <div className="calendar-header">
        <div className="staff-list">
          {schedule?.staffs?.map((staff: any) => (
            <div
              key={staff.id}
              onClick={() => handleStaffSelection(staff.id)}
              className={`staff ${
                staff.id === selectedStaffId ? "active" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
              >
                <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17-62.5t47-43.5q60-30 124.5-46T480-440q67 0 131.5 16T736-378q30 15 47 43.5t17 62.5v112H160Zm320-400q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm160 228v92h80v-32q0-11-5-20t-15-14q-14-8-29.5-14.5T640-332Zm-240-21v53h160v-53q-20-4-40-5.5t-40-1.5q-20 0-40 1.5t-40 5.5ZM240-240h80v-92q-15 5-30.5 11.5T260-306q-10 5-15 14t-5 20v32Zm400 0H320h320ZM480-640Z" />
              </svg>
              <span>{staff.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="calendar-wrapper">
        <FullCalendar
          key={calendarKey}
          ref={calendarRef}
          locale={auth.language}
          plugins={getPlugins()}
          contentHeight="auto"
          height="auto"
          aspectRatio={1.6}
          stickyHeaderDates={true}
          handleWindowResize={true}
          selectable={true}
          editable={true}
          eventOverlap={true}
          eventDurationEditable={false}
          initialView="dayGridMonth"
          initialDate={getFirstEventDate()}
          events={events}
          firstDay={1}
          dayMaxEventRows={8}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          eventContent={(eventInfo: any) => (
            <RenderEventContent eventInfo={eventInfo} />
          )}
          viewDidMount={(info) => {
            if (initialLoadRef.current && schedule?.assignments?.length > 0) {
              const firstEventDate = getFirstEventDate();
              info.view.calendar.gotoDate(firstEventDate);
              initialLoadRef.current = false;
            }
          }}
          datesSet={() => {}}
          dayCellContent={({ date }) => {
            const found = validDates().includes(
              dayjs(date).format("YYYY-MM-DD")
            );
            const isHighlighted = highlightedDates.includes(
              dayjs(date).format("DD-MM-YYYY")
            );

            // Bu tarihte çalışan diğer personelleri bul
            const pairsForThisDate = pairDates.filter(
              (p) => p.date === dayjs(date).format("DD-MM-YYYY")
            );

            // Pair sınıfları
            let pairClasses = "";

            // Her pair için renk ekle (en fazla 3 personelin rengi gösterilsin)
            if (pairsForThisDate.length > 0) {
              // Renkleri tekillestir
              const uniquePairs = pairsForThisDate.reduce<
                {
                  date: string;
                  color: string;
                  staffId: string;
                  staffName: string;
                }[]
              >((acc, current) => {
                const x = acc.find((item) => item.staffId === current.staffId);
                if (!x) {
                  return acc.concat([current]);
                } else {
                  return acc;
                }
              }, []);

              // İlk 3 personelin rengini göster
              const displayPairs = uniquePairs.slice(0, 3);

              displayPairs.forEach((pair, index) => {
                pairClasses += ` pair-${index + 1} ${pair.color}`;
              });
            }

            return (
              <div
                className={`day-cell ${found ? "" : "date-range-disabled"} ${
                  isHighlighted ? "highlighted-date-orange" : ""
                } ${pairClasses}`}
                title={pairsForThisDate.map((p) => p.staffName).join(", ")}
              >
                {dayjs(date).date()}

                {/* Pair belirteçleri */}
                {pairsForThisDate.length > 0 && (
                  <div className="pair-indicators">
                    {pairsForThisDate.slice(0, 3).map((pair, index) => (
                      <span
                        key={index}
                        className={`pair-indicator ${pair.color}`}
                        title={pair.staffName}
                      ></span>
                    ))}
                  </div>
                )}
              </div>
            );
          }}
          // Sürükleme işlemi tamamlandığında
          eventDrop={handleEventDrop}
        />
      </div>
      <EventModal />
      <ConfirmModal />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default CalendarContainer;
