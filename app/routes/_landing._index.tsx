import { title } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { containerVariants, enterAnimation, itemVariants } from "@/lib/framer/animations";
import { Form } from "@remix-run/react";
import axios from "axios";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export const meta: MetaFunction = () => {
	return [
		{
			title: title(),
		},
		{
			name: "description",
			content: "Land Your Dream Job with AI-Powered Career Tools",
		},
	];
};

const STEPS = [
	{
		number: 1,
		title: "Input Details",
		description: "Enter your experience, skills, and target job. Our AI does the rest.",
	},
	{
		number: 2,
		title: "Generate Documents",
		description: "Get instant AI-generated documents. Edit and perfect with our smart tools.",
	},
	{ number: 3, title: "Apply & Succeed", description: "Submit your polished applications and ace your interviews." },
];

export default function Index() {
	const { toast } = useToast();
	const howItWorksRef = useRef(null);
	const isInView = useInView(howItWorksRef, { amount: 0.6, once: true });

	async function handleSubmitEmail(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		try {
			await axios.post("api/mailing-list", formData);
			toast({ title: "Success!", description: "You have been added to the mailing list." });
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				const { error: errorMessage = "An unexpected error occurred. Please try again." } = error.response.data;
				toast({
					title: "Error",
					variant: "destructive",
					description: errorMessage,
				});
			} else toast({ title: "Error", description: "An unexpected error occurred. Please try again." });
		}
	}

	return (
		<div className="flex flex-col">
			<main className="flex-1">
				<motion.section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32" {...enterAnimation}>
					<div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
						<h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
							Land Your Dream Job with AI-Powered Career Tools
						</h1>
						<p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
							Create stunning resumes, compelling cover letters, and ace your interviews with EasyCV's
							AI-driven platform.
						</p>
						<div className="space-x-4 flex">
							<Link to="/signin">
								<Button size="lg">Get Started</Button>
							</Link>
							<Button variant="outline" size="lg">
								Learn More
							</Button>
						</div>
					</div>
				</motion.section>

				<motion.section
					{...enterAnimation}
					id="features"
					className="container space-y-6 bg-slate-50 dark:bg-transparent py-6 md:py-12 lg:py-24"
				>
					<div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
						<h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
							Supercharge Your Job Search
						</h2>
						<p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
							Our AI-powered tools help you create professional documents and prepare for interviews.
						</p>
					</div>
					<div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
						<Card>
							<CardHeader>
								<CardTitle>AI CV Generation</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Create professional, ATS-friendly resumes tailored to specific job descriptions in
									minutes.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Cover Letter Magic</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Generate compelling, personalized cover letters that perfectly complement your
									resume.
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Interview Prep AI</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									Practice with our AI interviewer to boost confidence and improve performance in real
									interviews.
								</p>
							</CardContent>
						</Card>
					</div>
				</motion.section>

				<motion.section
					ref={howItWorksRef}
					initial="hidden"
					animate={isInView ? "show" : "hidden"}
					variants={containerVariants}
					id="how-it-works"
					className="container py-8 md:py-12 lg:py-24"
				>
					<motion.div
						{...enterAnimation}
						className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
					>
						<h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">How It Works</h2>
						<p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
							Three simple steps to revolutionize your job search process.
						</p>
					</motion.div>
					<motion.div
						initial="hidden"
						animate={isInView ? "show" : "hidden"}
						variants={containerVariants}
						className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-8"
					>
						{STEPS.map(({ number, description, title }) => (
							<Step key={number} {...{ number, description, title }} />
						))}
					</motion.div>
				</motion.section>

				<motion.section {...enterAnimation} className="container py-8 md:py-12 lg:py-24">
					<div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
						<h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
							Ready to Land Your Dream Job?
						</h2>
						<p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
							Enter your email below to join the mailing list and receive updates on EasyCV's progress.
						</p>
						<div className="w-full max-w-sm space-y-2">
							<Form onSubmit={handleSubmitEmail} className="flex space-x-2">
								<Input
									className="flex-1"
									placeholder="Enter your email"
									id="email"
									name="email"
									type="email"
								/>
								<Button type="submit">Submit</Button>
							</Form>
							<p className="text-xs text-muted-foreground">
								We will email you with updates about new features.
							</p>
						</div>
					</div>
				</motion.section>
			</main>
		</div>
	);
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
	return (
		<motion.div variants={itemVariants} className="relative overflow-hidden rounded-lg border bg-background p-2">
			<div className="flex h-[180px] flex-col justify-between rounded-md p-6">
				<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
					<span className="text-2xl font-bold text-blue-600">{number}</span>
				</div>
				<div className="space-y-2">
					<h3 className="font-bold">{title}</h3>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</div>
		</motion.div>
	);
}
