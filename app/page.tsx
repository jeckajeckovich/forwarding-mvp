"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const tariffs = [
  { country: "Kenya", standardPerKg: 12, expressPerKg: 18, minPrice: 25, delivery: "10–20 days" },
  { country: "Ghana", standardPerKg: 10, expressPerKg: 16, minPrice: 20, delivery: "9–18 days" },
  { country: "South Africa", standardPerKg: 8, expressPerKg: 14, minPrice: 18, delivery: "7–12 days" },
  { country: "Botswana", standardPerKg: 11, expressPerKg: 17, minPrice: 24, delivery: "9–16 days" },
  { country: "Nigeria", standardPerKg: 13, expressPerKg: 20, minPrice: 28, delivery: "10–22 days" },
];

const warehouses = {
  Germany: {
    label: "Germany Hub",
    address: "Europa Hub, Friedrichstr. 21, Berlin, Germany",
  },
  Serbia: {
    label: "Serbia Hub",
    address: "Balkan Forwarding Center, Bulevar despota Stefana 54, Belgrade, Serbia",
  },
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function generateCustomerId() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function makeAddress(name: string, id: string, warehouseCountry: "Germany" | "Serbia") {
  const hub = warehouses[warehouseCountry];
  return `${name} #${id}, ${hub.address}`;
}

function statusColor(status: string) {
  switch (status) {
    case "Expected":
      return "bg-slate-100 text-slate-700";
    case "Arrived":
      return "bg-emerald-100 text-emerald-700";
    case "Ready":
      return "bg-amber-100 text-amber-700";
    case "Shipped":
      return "bg-sky-100 text-sky-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

type WarehouseCountry = "Germany" | "Serbia";
type AuthMode = "register" | "login";

type User = {
  name: string;
  email: string;
  password: string;
  warehouseCountry: WarehouseCountry;
  id: string;
  address: string;
};

type PackageItem = {
  id: string;
  tracking: string;
  store: string;
  weight: number;
  status: string;
  arrivalDate: string;
  storageDaysLeft: number;
  shippingAddress: string;
  shippingMethod: string;
  notes: string;
};

export default function Page() {
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const [loadingSession, setLoadingSession] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    password: "",
    warehouseCountry: "Germany",
    id: "",
    address: "",
  });

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [destination, setDestination] = useState("Kenya");
  const [shippingMethod, setShippingMethod] = useState("Standard");
  const [removePackaging, setRemovePackaging] = useState(true);
  const [extraProtection, setExtraProtection] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newPackage, setNewPackage] = useState({
    tracking: "",
    store: "",
    weight: "",
    status: "Expected",
  });

async function loadProfile(authUserId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, email, customer_id, warehouse_country, warehouse_address")
    .eq("id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("Profile load error:", error);
    return false;
  }

  if (!data) {
    console.log("No profile found yet");
    return false;
  }

  setUser((prev) => ({
    ...prev,
    name: data.full_name ?? "",
    email: data.email ?? "",
    password: "",
    warehouseCountry: (data.warehouse_country as WarehouseCountry) ?? "Germany",
    id: data.customer_id ?? "",
    address: data.warehouse_address ?? "",
  }));

  return true;
}

  setUser((prev) => ({
    ...prev,
    name: data.full_name ?? "",
    email: data.email ?? "",
    password: "",
    warehouseCountry: (data.warehouse_country as WarehouseCountry) ?? "Germany",
    id: data.customer_id ?? "",
    address: data.warehouse_address ?? "",
  }));

  setIsRegistered(true);
  return true;
}

useEffect(() => {
  let mounted = true;

  async function bootstrap() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        return;
      }

      const session = data.session;

      if (!mounted) return;

      setLoadingSession(false);

      if (session?.user) {
        const loaded = await loadProfile(session.user.id);

        if (!mounted) return;

        // Даже если профиль не загрузился, пользователя не выбрасываем
        setIsRegistered(true);

        if (!loaded) {
          setUser((prev) => ({
            ...prev,
            email: session.user.email ?? "",
            password: "",
          }));
        }
      } else {
        setIsRegistered(false);
      }
    } catch (err) {
      console.error("Bootstrap crash:", err);
      if (mounted) {
        setLoadingSession(false);
        setIsRegistered(false);
      }
    }
  }

  bootstrap();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!mounted) return;

    setLoadingSession(false);

    try {
      if (session?.user) {
        const loaded = await loadProfile(session.user.id);

        // Не выбрасываем auth-пользователя, даже если профиль не подтянулся
        setIsRegistered(true);

        if (!loaded) {
          setUser((prev) => ({
            ...prev,
            email: session.user.email ?? "",
            password: "",
          }));
        }
      } else {
        setIsRegistered(false);
        setUser({
          name: "",
          email: "",
          password: "",
          warehouseCountry: "Germany",
          id: "",
          address: "",
        });
      }
    } catch (err) {
      console.error("Auth state change crash:", err);
      if (mounted) {
        setIsRegistered(false);
      }
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const generatedCustomerId = generateCustomerId();
      const finalAddress = makeAddress(
        user.name || "Customer",
        generatedCustomerId,
        user.warehouseCountry
      );

      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
      });

      if (error) {
        alert(error.message);
        console.error("Sign up error:", error);
        return;
      }

      const authUser = data.user;

      if (!authUser) {
        alert("User not created");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authUser.id,
        customer_id: generatedCustomerId,
        full_name: user.name,
        email: user.email,
        warehouse_country: user.warehouseCountry,
        warehouse_address: finalAddress,
      });

      if (profileError) {
        alert(profileError.message);
        console.error("Profile insert error:", profileError);
        return;
      }

      setUser((prev) => ({
        ...prev,
        id: generatedCustomerId,
        address: finalAddress,
      }));

      setIsRegistered(true);
    } finally {
      setAuthLoading(false);
    }
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setAuthLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (error) {
      alert(error.message);
      console.error("Login error:", error);
      return;
    }

    if (data.user) {
      setIsRegistered(true);
    }
  } finally {
    setAuthLoading(false);
  }
};

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      console.error("Logout error:", error);
      return;
    }

    setIsRegistered(false);
    setAuthMode("login");
    setPackages([]);
    setSelectedPackages([]);
  };

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage.tracking || !newPackage.store || !newPackage.weight) return;

    const pkg: PackageItem = {
      id: `PKG-${1000 + packages.length + 1}`,
      tracking: newPackage.tracking,
      store: newPackage.store,
      weight: Number(newPackage.weight),
      status: newPackage.status,
      arrivalDate: new Date().toISOString().slice(0, 10),
      storageDaysLeft: 21,
      shippingAddress: "",
      shippingMethod: "",
      notes: "",
    };

    setPackages((prev) => [pkg, ...prev]);
    setNewPackage({
      tracking: "",
      store: "",
      weight: "",
      status: "Expected",
    });
  };

  const togglePackage = (id: string) => {
    setSelectedPackages((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selected = useMemo(
    () => packages.filter((pkg) => selectedPackages.includes(pkg.id) && pkg.status !== "Shipped"),
    [packages, selectedPackages]
  );

  const totalWeight = useMemo(
    () => selected.reduce((sum, pkg) => sum + pkg.weight, 0),
    [selected]
  );

  const tariff = tariffs.find((item) => item.country === destination);

  const shippingCost = useMemo(() => {
    if (!tariff) return 0;
    const rate = shippingMethod === "Express" ? tariff.expressPerKg : tariff.standardPerKg;
    return Math.max(tariff.minPrice, totalWeight * rate);
  }, [tariff, totalWeight, shippingMethod]);

  const extras = useMemo(() => {
    let total = 0;
    if (removePackaging) total += 3;
    if (extraProtection) total += 5;
    if (insurance) total += Math.max(4, shippingCost * 0.05);
    return total;
  }, [removePackaging, extraProtection, insurance, shippingCost]);

  const serviceFee = 7;
  const total = shippingCost + extras + serviceFee;

  const createShipment = () => {
    if (!deliveryAddress || selected.length === 0) return;
    setPackages((prev) =>
      prev.map((pkg) =>
        selectedPackages.includes(pkg.id)
          ? {
              ...pkg,
              status: "Shipped",
              shippingAddress: deliveryAddress,
              shippingMethod,
              storageDaysLeft: 0,
            }
          : pkg
      )
    );
    setSelectedPackages([]);
    setDeliveryAddress("");
    setActiveTab("dashboard");
  };

  if (loadingSession) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
          <div className="text-lg font-semibold text-slate-900">Loading session...</div>
        </div>
      </main>
    );
  }

  if (!isRegistered) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-sm text-white">Forwarding MVP</div>
                <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
                  {authMode === "register" ? "Create your forwarding account" : "Sign in to your account"}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                  Register, get your personal warehouse ID, receive your EU delivery address, add parcels manually by tracking number, and manage consolidation and checkout in one dashboard.
                </p>
              </div>

              <form
                onSubmit={authMode === "register" ? handleRegister : handleLogin}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="mb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                      authMode === "register" ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                      authMode === "login" ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    Login
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  {authMode === "register" ? "Sign up" : "Sign in"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {authMode === "register"
                    ? "Create a new account and get your warehouse address."
                    : "Use your email and password to access your dashboard."}
                </p>

                <div className="mt-6 space-y-4">
                  {authMode === "register" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">Full name</label>
                      <input
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                        value={user.name}
                        onChange={(e) => setUser((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Alex Morgan"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                      value={user.email}
                      onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="alex@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Password</label>
                    <input
                      type="password"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                      value={user.password}
                      onChange={(e) => setUser((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {authMode === "register" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">Warehouse location</label>
                      <select
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                        value={user.warehouseCountry}
                        onChange={(e) =>
                          setUser((prev) => ({
                            ...prev,
                            warehouseCountry: e.target.value as WarehouseCountry,
                          }))
                        }
                      >
                        <option value="Germany">Germany</option>
                        <option value="Serbia">Serbia</option>
                      </select>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60"
                >
                  {authLoading
                    ? "Please wait..."
                    : authMode === "register"
                    ? "Create account"
                    : "Sign in"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm text-slate-500">Customer dashboard</div>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome, {user.name}</h1>
                <p className="mt-2 text-slate-600">Manage incoming parcels, assign shipping instructions, and complete payment from one place.</p>
              </div>
              <div className="flex gap-3">
                <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
                  <div className="text-xs uppercase tracking-wide text-slate-300">Customer ID</div>
                  <div className="mt-1 text-2xl font-bold">#{user.id}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Your warehouse address</h2>
            <p className="mt-2 text-sm text-slate-500">Use this address when placing orders in European stores.</p>
            <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-sm leading-7 text-white">
              {user.address}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              ["dashboard", "Dashboard"],
              ["add-package", "Add package"],
              ["manage", "Manage packages"],
              ["checkout", "Checkout"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                  activeTab === key ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {activeTab === "dashboard" && (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Your package list</h2>
            <div className="mt-6 space-y-4">
              {packages.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  No packages yet. Go to <span className="font-medium text-slate-900">Add package</span> and add your first tracking number.
                </div>
              )}

              {packages.map((pkg) => (
                <div key={pkg.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-900">{pkg.id}</div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(pkg.status)}`}>
                          {pkg.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-500">{pkg.store} · {pkg.tracking}</div>
                      <div className="mt-1 text-sm text-slate-500">{pkg.weight} kg · Added {pkg.arrivalDate}</div>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedPackages.includes(pkg.id)}
                        disabled={pkg.status === "Shipped"}
                        onChange={() => togglePackage(pkg.id)}
                      />
                      Select for shipment
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "add-package" && (
          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <form onSubmit={handleAddPackage} className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Add new package</h2>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Tracking number</label>
                  <input
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    value={newPackage.tracking}
                    onChange={(e) => setNewPackage((prev) => ({ ...prev, tracking: e.target.value }))}
                    placeholder="DE123456789"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Store name</label>
                  <input
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    value={newPackage.store}
                    onChange={(e) => setNewPackage((prev) => ({ ...prev, store: e.target.value }))}
                    placeholder="Amazon / Zalando / MediaMarkt"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Estimated weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                      value={newPackage.weight}
                      onChange={(e) => setNewPackage((prev) => ({ ...prev, weight: e.target.value }))}
                      placeholder="1.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Status</label>
                    <select
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                      value={newPackage.status}
                      onChange={(e) => setNewPackage((prev) => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="Expected">Expected</option>
                      <option value="Arrived">Arrived</option>
                      <option value="Ready">Ready</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white">
                Add package to account
              </button>
            </form>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Package instructions</h2>
              <div className="mt-6 space-y-4 text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">Use the exact customer name and ID in the delivery address so warehouse staff can match incoming parcels.</div>
                <div className="rounded-2xl bg-slate-50 p-4">Add tracking number as soon as the order is shipped by the store.</div>
                <div className="rounded-2xl bg-slate-50 p-4">Estimated weight helps pre-calculate shipping cost before warehouse arrival.</div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "manage" && (
          <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Select and manage packages</h2>
              <div className="mt-6 space-y-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{pkg.id}</div>
                        <div className="mt-1 text-sm text-slate-500">{pkg.store} · {pkg.tracking}</div>
                        <div className="mt-1 text-sm text-slate-500">Status: {pkg.status} · {pkg.weight} kg</div>
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedPackages.includes(pkg.id)}
                          disabled={pkg.status === "Shipped"}
                          onChange={() => togglePackage(pkg.id)}
                        />
                        Add to consolidation
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Selected summary</h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex justify-between text-sm"><span>Packages selected</span><span className="font-semibold">{selected.length}</span></div>
                  <div className="mt-2 flex justify-between text-sm"><span>Total weight</span><span className="font-semibold">{totalWeight.toFixed(1)} kg</span></div>
                </div>
                <button
                  onClick={() => setActiveTab("checkout")}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white"
                >
                  Continue to checkout
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "checkout" && (
          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Shipment checkout</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Destination country</label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  >
                    {tariffs.map((item) => (
                      <option key={item.country} value={item.country}>{item.country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Shipping method</label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">Final delivery address</label>
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-slate-300 px-4 py-3"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Recipient name, street, city, postal code, country, phone number"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <input type="checkbox" checked={removePackaging} onChange={(e) => setRemovePackaging(e.target.checked)} />
                    Remove original packaging (+$3)
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <input type="checkbox" checked={extraProtection} onChange={(e) => setExtraProtection(e.target.checked)} />
                    Add extra protection (+$5)
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} />
                    Add insurance (5% of shipping, min $4)
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">Payment summary</h2>
              <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
                <div className="flex justify-between text-sm"><span>Selected packages</span><span>{selected.length}</span></div>
                <div className="mt-2 flex justify-between text-sm"><span>Total weight</span><span>{totalWeight.toFixed(1)} kg</span></div>
                <div className="mt-2 flex justify-between text-sm"><span>Transit time</span><span>{tariff?.delivery || "—"}</span></div>
                <div className="mt-4 flex justify-between text-sm"><span>Shipping</span><span>{money(shippingCost)}</span></div>
                <div className="mt-2 flex justify-between text-sm"><span>Extras</span><span>{money(extras)}</span></div>
                <div className="mt-2 flex justify-between text-sm"><span>Service fee</span><span>{money(serviceFee)}</span></div>
                <div className="mt-4 flex justify-between border-t border-slate-700 pt-4 text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
              </div>

              <button
                onClick={createShipment}
                className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white"
              >
                Pay & create shipment
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}