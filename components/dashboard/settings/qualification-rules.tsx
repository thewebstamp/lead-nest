// components/dashboard/settings/qualification-rules.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Save, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { QualificationRule } from "@/lib/services/leads/qualification";

interface QualificationRulesProps {
    businessId: string;
    initialRules: QualificationRule[];
    initialThresholds: {
        high: number;
        medium: number;
    };
}

export default function QualificationRules({
    businessId,
    initialRules,
    initialThresholds,
}: QualificationRulesProps) {
    const safeRules = (initialRules || []).filter((rule) => rule.field && rule.condition);

    const [rules, setRules] = useState<QualificationRule[]>(safeRules);
    const [thresholds, setThresholds] = useState(initialThresholds);
    const [isLoading, setIsLoading] = useState(false);

    const [newRule, setNewRule] = useState<Omit<QualificationRule, "id">>({
        field: "serviceType",
        condition: "contains",
        value: "",
        score: 0,
        tag: "",
    });

    const addRule = () => {
        if (!newRule.value || newRule.value.toString().trim() === "") {
            toast({
                title: "Error",
                description: "Rule value is required",
                variant: "destructive",
            });
            return;
        }

        const rule: QualificationRule = {
            ...newRule,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };

        setRules([...rules, rule]);

        setNewRule({
            field: "serviceType",
            condition: "contains",
            value: "",
            score: 0,
            tag: "",
        });

        toast({
            title: "Rule added",
            description: "Rule has been added to the list",
        });
    };

    const removeRule = (id: string) => {
        setRules(rules.filter((rule) => rule.id !== id));
    };

    const saveRules = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    qualification: {
                        rules,
                        priorityThresholds: thresholds,
                    },
                }),
            });

            if (!response.ok) throw new Error("Failed to save rules");

            toast({
                title: "Success",
                description: "Qualification rules saved successfully",
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to save qualification rules",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fieldOptions: {
        value: QualificationRule["field"];
        label: string;
    }[] = [
            { value: "serviceType", label: "Service Type" },
            { value: "location", label: "Location" },
            { value: "message", label: "Message" },
            { value: "contactCompleteness", label: "Contact Completeness" },
            { value: "timeOfDay", label: "Time of Day" },
        ];

    const conditionOptions: {
        value: QualificationRule["condition"];
        label: string;
    }[] = [
            { value: "equals", label: "Equals" },
            { value: "contains", label: "Contains" },
            { value: "startsWith", label: "Starts With" },
            { value: "endsWith", label: "Ends With" },
            { value: "regex", label: "Matches Regex" },
            { value: "in", label: "Is In List (comma-separated)" },
            { value: "notEmpty", label: "Is Not Empty" },
        ];

    const getFieldExample = (field: QualificationRule["field"]) => {
        switch (field) {
            case "serviceType":
                return 'e.g., "Emergency Plumbing" or "Web Design"';
            case "location":
                return 'e.g., "New York" or "London"';
            case "message":
                return 'e.g., "urgent" or "ASAP"';
            case "contactCompleteness":
                return "Number 1–4 (1=minimal, 4=complete)";
            case "timeOfDay":
                return "Hour 0–23 (e.g., 9 for 9 AM)";
            default:
                return "";
        }
    };

    return (
        <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Lead Qualification Rules</CardTitle>
                <CardDescription className="text-gray-300">
                    Define rules to automatically score and prioritize incoming leads
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Priority Thresholds */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Priority Thresholds</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-200">High Priority Score</Label>
                            <Input
                                type="number"
                                value={thresholds.high}
                                onChange={(e) =>
                                    setThresholds({
                                        ...thresholds,
                                        high: parseInt(e.target.value) || 80,
                                    })
                                }
                                className="border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-200">Medium Priority Score</Label>
                            <Input
                                type="number"
                                value={thresholds.medium}
                                onChange={(e) =>
                                    setThresholds({
                                        ...thresholds,
                                        medium: parseInt(e.target.value) || 60,
                                    })
                                }
                                className="border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-200">Low Priority</Label>
                            <div className="h-10 px-3 py-2 border border-gray-700 rounded-xl bg-gray-800/50 text-gray-300 text-sm flex items-center">
                                &lt; {thresholds.medium}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Add Rule */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Add New Rule</h3>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <Label className="text-gray-200">Field</Label>
                            <Select
                                value={newRule.field}
                                onValueChange={(value) =>
                                    setNewRule({
                                        ...newRule,
                                        field: value as QualificationRule["field"],
                                    })
                                }
                            >
                                <SelectTrigger className="border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {fieldOptions.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-gray-200">Condition</Label>
                            <Select
                                value={newRule.condition}
                                onValueChange={(value) =>
                                    setNewRule({
                                        ...newRule,
                                        condition: value as QualificationRule["condition"],
                                    })
                                }
                            >
                                <SelectTrigger className="border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {conditionOptions.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-gray-200">Value</Label>
                            <Input
                                value={String(newRule.value)}
                                placeholder={getFieldExample(newRule.field)}
                                onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                                className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                        </div>

                        <div>
                            <Label className="text-gray-200">Score</Label>
                            <Input
                                type="number"
                                value={newRule.score}
                                onChange={(e) =>
                                    setNewRule({
                                        ...newRule,
                                        score: parseInt(e.target.value) || 0,
                                    })
                                }
                                className="border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                        </div>

                        <div>
                            <Label className="text-gray-200">Tag (Optional)</Label>
                            <Input
                                value={newRule.tag || ""}
                                onChange={(e) => setNewRule({ ...newRule, tag: e.target.value })}
                                className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={addRule}
                            className="bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 rounded-xl"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Rule
                        </Button>
                    </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Existing Rules */}
                <div className="space-y-4">
                    {rules.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl bg-gray-800/20">
                            <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-400">No rules defined</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-white">Existing Rules ({rules.length})</h3>
                            <div className="space-y-3">
                                {rules.map((rule) => (
                                    <div
                                        key={rule.id}
                                        className="flex items-start justify-between p-4 border border-white/10 rounded-xl hover:bg-gray-700/30 transition-all"
                                    >
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 rounded-full">
                                                    {rule.field}
                                                </Badge>
                                                <Badge variant="secondary" className="bg-gray-600/20 text-gray-300 border-gray-600 rounded-full">
                                                    {rule.condition}
                                                </Badge>
                                                <span className="text-sm font-medium text-white">{String(rule.value)}</span>
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                Score: <span className="font-semibold text-blue-400">{rule.score}</span>
                                                {rule.tag && (
                                                    <span className="ml-2">
                                                        • Tag: <span className="font-semibold">{rule.tag}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => removeRule(rule.id)}
                                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg ml-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={saveRules}
                        disabled={isLoading}
                        className="bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 rounded-xl"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save Rules
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}